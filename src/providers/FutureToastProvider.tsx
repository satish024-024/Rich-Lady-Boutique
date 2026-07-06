"use client";

import React from "react";
import { Toaster as SonnerToaster } from "sonner";

export function FutureToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Future: Database trigger toast alerts */}
      <SonnerToaster
        position="bottom-right"
        toastOptions={{
          style: {
            backgroundColor: "#FFFDF9",
            color: "#2D221C",
            border: "1px solid #E5D8C9",
            fontFamily: "var(--font-sans)",
            borderRadius: "8px",
          },
          className: "rich-lady-toast",
        }}
      />
    </>
  );
}
