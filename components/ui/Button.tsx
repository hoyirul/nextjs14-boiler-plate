"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  children,
  fullWidth,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const base = "py-2 rounded-md transition ";
  const width = fullWidth ? "w-full" : "";

  let variantClasses = "";
  switch (variant) {
    case "primary":
      variantClasses = "bg-black text-white hover:bg-gray-900";
      break;
    case "secondary":
      variantClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300";
      break;
    case "outline":
      variantClasses = "border border-gray-800 text-gray-800 bg-transparent hover:bg-gray-100";
      break;
  }

  return (
    <button
      {...props}
      className={`${base} ${width} ${variantClasses} ${className || ""}`}
    >
      {children}
    </button>
  );
}
