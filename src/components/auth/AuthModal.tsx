"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle2, Phone, User, Mail, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isAdmin } from "@/utils/auth";
import { auth } from "@/utils/firebaseClient";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const router = useRouter();
  const [justLoggedInAdmin, setJustLoggedInAdmin] = useState(false);
  
  // States: 'choose' | 'verify_sms' | 'success'
  const [step, setStep] = useState<"choose" | "verify_sms" | "success">("choose");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  
  // Codes
  const [smsOtp, setSmsOtp] = useState("");

  // Timer states for OTP Expiry & Resend
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(0); // 60 seconds throttle
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // Firebase Auth references
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }

    const toastId = toast.loading("Verifying credentials...");
    setIsLoading(true);

    try {
      // 1. Check for Admin Hardcoded Bypass
      if (email.trim().toLowerCase() === "prakashkadali3723@gmail.com" && password === "1234567890") {
        const adminUser = {
          name: "Prakash Kadali",
          email: "prakashkadali3723@gmail.com",
          phone: "9030443306"
        };
        login(adminUser);
        toast.success("Welcome back, Admin Prakash!", { id: toastId });
        onClose();
        router.push("/admin");
        return;
      }

      // 2. Fallback to Firebase Email Authentication
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;
      
      const userObj = {
        name: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
        email: fbUser.email,
        phone: fbUser.phoneNumber || ""
      };
      
      login(userObj);
      toast.success("Logged in successfully!", { id: toastId });
      onClose();
      
      if (isAdmin(userObj)) {
        router.push("/admin");
      }
    } catch (err: any) {
      console.error("Email login error:", err);
      toast.error(err.message || "Failed to login. Please check credentials.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamically initialize invisible reCAPTCHA
  const initRecaptcha = () => {
    if (!recaptchaVerifierRef.current && typeof window !== "undefined") {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
        });
      } catch (err) {
        console.error("Failed to initialize reCAPTCHA verifier:", err);
      }
    }
  };

  // Clear timers on close/unmount
  useEffect(() => {
    return () => {
      stopOtpTimer();
      stopCooldownTimer();
    };
  }, []);

  const startOtpTimer = () => {
    stopOtpTimer();
    setOtpExpirySeconds(300);
    timerRef.current = setInterval(() => {
      setOtpExpirySeconds((prev) => {
        if (prev <= 1) {
          stopOtpTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopOtpTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startCooldownTimer = () => {
    stopCooldownTimer();
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          stopCooldownTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCooldownTimer = () => {
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Reset all states
  const resetForm = () => {
    setStep("choose");
    setName("");
    setEmail("");
    setPhone("");
    setSmsOtp("");
    setJustLoggedInAdmin(false);
    stopOtpTimer();
    stopCooldownTimer();
    setIsLoading(false);
    confirmationResultRef.current = null;
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      const shouldRedirect = justLoggedInAdmin;
      resetForm();
      onClose();
      if (shouldRedirect) {
        router.push("/admin");
      }
    }
  };

  // ----------------------------------------------------
  // LOGIN FLOW (Step 1)
  // ----------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Initializing secure login...");
    try {
      initRecaptcha();
      const appVerifier = recaptchaVerifierRef.current;
      if (!appVerifier) {
        throw new Error("reCAPTCHA verifier not initialized");
      }

      // Format to E.164
      let formattedPhone = cleanPhone;
      if (!formattedPhone.startsWith("+")) {
        if (formattedPhone.length === 10) {
          formattedPhone = `+91${formattedPhone}`;
        } else {
          formattedPhone = `+${formattedPhone}`;
        }
      }

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      confirmationResultRef.current = confirmationResult;

      toast.success("Verification code sent successfully!", { id: toastId });
      setStep("verify_sms");
      startOtpTimer();
      startCooldownTimer();
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      toast.error(err.message || "Failed to send verification code. Please check your Firebase configs.", { id: toastId });
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // REGISTRATION FLOW (Step 1: Details)
  // ----------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Initializing phone verification...");
    try {
      initRecaptcha();
      const appVerifier = recaptchaVerifierRef.current;
      if (!appVerifier) {
        throw new Error("reCAPTCHA verifier not initialized");
      }

      // Format to E.164
      let formattedPhone = cleanPhone;
      if (!formattedPhone.startsWith("+")) {
        if (formattedPhone.length === 10) {
          formattedPhone = `+91${formattedPhone}`;
        } else {
          formattedPhone = `+${formattedPhone}`;
        }
      }

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      confirmationResultRef.current = confirmationResult;

      toast.success("Verification code sent to your phone!", { id: toastId });
      setStep("verify_sms");
      startOtpTimer();
      startCooldownTimer();
    } catch (err: any) {
      console.error("Firebase Register Error:", err);
      toast.error(err.message || "Failed to send verification code. Please check your Firebase configs.", { id: toastId });
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // LOGIN/REGISTER FLOW (Step 3: Verify Phone OTP)
  // ----------------------------------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsOtp || smsOtp.length < 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    if (otpExpirySeconds <= 0) {
      toast.error("This OTP has expired. Please request a new code.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Verifying OTP...");
    try {
      const confirmationResult = confirmationResultRef.current;
      if (!confirmationResult) {
        throw new Error("No active verification session. Please request a new code.");
      }

      // 1. Verify OTP with Firebase Client
      const userCredential = await confirmationResult.confirm(smsOtp);
      const idToken = await userCredential.user.getIdToken();

      // 2. Authenticate on backend & fetch JWT
      const isRegistering = activeTab === "register";
      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name: isRegistering ? name : undefined,
          email: isRegistering ? email : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed on server");
      }

      // 3. Save JWT
      if (data.token) {
        localStorage.setItem("rich-lady-auth-token", data.token);
      }

      const userObj = {
        phone: data.user.phone,
        name: data.user.name,
        email: data.user.email,
      };

      // Successful Auth! Log user session
      login(userObj);
      setJustLoggedInAdmin(isAdmin(userObj));

      toast.success(isRegistering ? "Welcome! Account created successfully." : "Welcome back!", { id: toastId });
      stopOtpTimer();
      stopCooldownTimer();
      setStep("success");
    } catch (err: any) {
      console.error("Firebase Verify OTP Error:", err);
      toast.error(err.message || "OTP validation failed. Please check the code and try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------
  // RESEND OTP
  // ----------------------------------------------------
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    const toastId = toast.loading("Resending code...");
    try {
      initRecaptcha();
      const appVerifier = recaptchaVerifierRef.current;
      if (!appVerifier) {
        throw new Error("reCAPTCHA verifier not initialized");
      }

      const cleanPhone = phone.trim();
      let formattedPhone = cleanPhone;
      if (!formattedPhone.startsWith("+")) {
        if (formattedPhone.length === 10) {
          formattedPhone = `+91${formattedPhone}`;
        } else {
          formattedPhone = `+${formattedPhone}`;
        }
      }

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      confirmationResultRef.current = confirmationResult;

      toast.success("New OTP code dispatched successfully!", { id: toastId });
      startOtpTimer();
      startCooldownTimer();
      setSmsOtp("");
    } catch (err: any) {
      console.error("Firebase Resend OTP Error:", err);
      toast.error(err.message || "Resend failed", { id: toastId });
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
          />

          {/* Luxury Auth Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-md bg-primary-bg border border-border-accent/40 rounded-[2.5rem] shadow-luxury z-50 overflow-hidden font-sans select-none flex flex-col"
          >
            {/* Top Header Card */}
            <div className="p-6 border-b border-border-accent/25 flex justify-between items-center bg-card">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-muted-gold" />
                <span className="font-serif text-lg tracking-wider text-primary-text font-semibold">
                  {step === "success" ? "Access Granted" : "Boutique Member Portal"}
                </span>
              </div>
              {!isLoading && (
                <button
                  onClick={handleClose}
                  className="p-1.5 text-primary-text hover:text-muted-gold transition-colors rounded-full hover:bg-secondary-bg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto no-scrollbar">
              
              {/* STEP 1: CHOOSE (Login Phone Input / Register Tab Selection) */}
              {step === "choose" && (
                <div className="flex flex-col gap-6">
                  {/* Tab controls */}
                  <div className="flex bg-[#FAF8F3]/60 border border-border-accent/30 rounded-full p-1">
                    <button
                      onClick={() => setActiveTab("login")}
                      className={`flex-1 py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                        activeTab === "login"
                          ? "bg-forest-green text-primary-bg shadow-sm"
                          : "text-secondary-text hover:text-primary-text"
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setActiveTab("register")}
                      className={`flex-1 py-2 text-[10px] font-sans font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                        activeTab === "register"
                          ? "bg-forest-green text-primary-bg shadow-sm"
                          : "text-secondary-text hover:text-primary-text"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {activeTab === "login" && (
                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => setLoginMethod(loginMethod === "phone" ? "email" : "phone")}
                        className="text-[9px] uppercase tracking-wider font-sans font-bold text-muted-gold hover:text-forest-green transition-colors cursor-pointer"
                      >
                        {loginMethod === "phone" ? "Login with Email & Password" : "Login with Mobile Number"}
                      </button>
                    </div>
                  )}

                  {activeTab === "login" ? (
                    loginMethod === "phone" ? (
                      /* PHONE LOGIN FORM */
                      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                        <div className="text-center mb-2">
                          <p className="text-xs text-secondary-text font-light leading-relaxed">
                            Enter your mobile number below. We will send you a secure SMS verification code.
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Mobile Number</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text font-bold text-xs">+91</span>
                            <input
                              required
                              type="tel"
                              maxLength={10}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                              placeholder="Enter 10-digit number"
                              className="w-full pl-14 pr-4 py-3.5 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-forest-green hover:bg-[#1a2b24] text-primary-bg py-4 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-4 disabled:opacity-50"
                        >
                          Send Secure OTP
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      /* EMAIL LOGIN FORM */
                      <form onSubmit={handleEmailLoginSubmit} className="flex flex-col gap-4">
                        <div className="text-center mb-2">
                          <p className="text-xs text-secondary-text font-light leading-relaxed">
                            Enter your email address and password below to log in securely.
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
                            <input
                              required
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="admin@richladyboutique.com"
                              className="w-full pl-11 pr-4 py-3.5 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Password</label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
                            <input
                              required
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full pl-11 pr-4 py-3.5 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-forest-green hover:bg-[#1a2b24] text-primary-bg py-4 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-4 disabled:opacity-50"
                        >
                          Secure Login
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    )
                  ) : (
                    /* REGISTER FORM DETAILS */
                    <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                      <div className="text-center mb-2">
                        <p className="text-xs text-secondary-text font-light leading-relaxed">
                          Welcome to Rich Lady Boutique. Fill in your details below to activate your premium member profile.
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
                          <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full pl-11 pr-4 py-3 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="yourname@domain.com"
                            className="w-full pl-11 pr-4 py-3 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Mobile Number</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text font-bold text-xs">+91</span>
                          <input
                            required
                            type="tel"
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            placeholder="Enter 10-digit number"
                            className="w-full pl-14 pr-4 py-3 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-forest-green hover:bg-[#1a2b24] text-primary-bg py-4 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-4 disabled:opacity-50"
                      >
                        Register &amp; Verify Phone
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 3: VERIFY SMS OTP (Both Login & Register) */}
              {step === "verify_sms" && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                  <div className="text-center">
                    <h3 className="font-serif text-base text-muted-gold font-semibold uppercase tracking-wider mb-2">
                      Secure Phone Verification
                    </h3>
                    <p className="text-xs text-secondary-text font-light leading-relaxed">
                      We have sent a 6-digit OTP code to <b className="font-semibold text-primary-text">+91 {phone}</b>. Please enter it below to authorize this session.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text text-center">Enter 6-Digit OTP</label>
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={smsOtp}
                      onChange={(e) => setSmsOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 654321"
                      className="w-full px-4 py-3.5 bg-card border border-border-accent/40 rounded-full text-center text-sm font-mono tracking-widest text-primary-text focus:outline-none focus:border-muted-gold"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Resend Cooldown & OTP Expiry */}
                  <div className="flex justify-between items-center text-[10px] text-secondary-text px-2">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-muted-gold" />
                      <span>Expires in: <b>{formatTimer(otpExpirySeconds)}</b></span>
                    </div>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isLoading}
                      className={`flex items-center gap-1 font-semibold uppercase tracking-wider hover:text-muted-gold transition-colors ${
                        resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep("choose")}
                      disabled={isLoading}
                      className="w-1/3 border border-border-accent/40 hover:border-primary-text py-4 text-[9px] font-sans font-semibold tracking-wider uppercase rounded-full transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || otpExpirySeconds <= 0}
                      className="w-2/3 bg-forest-green hover:bg-[#1a2b24] text-primary-bg py-4 text-[9px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      Verify &amp; Log In
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: SUCCESS */}
              {step === "success" && (
                <div className="flex flex-col gap-6 items-center text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-xs">
                    <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif text-2xl text-primary-text font-normal">
                      {justLoggedInAdmin ? "Admin Access Granted" : "Welcome to Rich Lady"}
                    </h3>
                    <p className="text-xs text-secondary-text font-light leading-relaxed max-w-[280px]">
                      {justLoggedInAdmin
                        ? "Your admin session is authenticated successfully. Welcome to the boutique management portal."
                        : "Your session is authenticated successfully. Welcome to your personalized luxury fashion journey."}
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg w-full py-4 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 cursor-pointer shadow-sm mt-4"
                  >
                    {justLoggedInAdmin ? "Go to Admin Panel" : "Continue Shopping"}
                  </button>
                </div>
              )}

            </div>
          </motion.div>
          {/* Invisible container for Firebase Phone Auth CAPTCHA */}
          <div id="recaptcha-container" className="hidden"></div>
        </>
      )}
    </AnimatePresence>
  );
}
