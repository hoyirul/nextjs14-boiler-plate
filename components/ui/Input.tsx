"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="mb-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full border px-3 py-2 rounded-lg text-gray-900
          focus:outline-none focus:ring-2 focus:border-black 
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-black"}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
