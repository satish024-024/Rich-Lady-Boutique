export function isAdmin(user: { phone: string; email?: string | null } | null): boolean {
  if (!user) return false;
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || "9030443306";
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@richladyboutique.com";
  
  // Extract last 10 digits to normalize phone formats (e.g. +91 vs plain phone)
  const cleanUserPhone = user.phone.replace(/\D/g, "").slice(-10);
  const cleanAdminPhone = adminPhone.replace(/\D/g, "").slice(-10);
  
  return (
    cleanUserPhone === cleanAdminPhone ||
    user.email === adminEmail ||
    user.email === "prakashkadali3723@gmail.com"
  );
}
