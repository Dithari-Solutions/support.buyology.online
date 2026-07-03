"use client";
import React from "react";

interface Option {
  value: string;
  label: string;
}

/** Controlled native select styled to match the TailAdmin inputs. */
export default function SelectField({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  className = "",
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 ${
        value ? "text-gray-800 dark:text-white/90" : "text-gray-400"
      } ${className}`}
    >
      {placeholder && (
        <option value="" disabled className="text-gray-400">
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value} className="text-gray-700 dark:bg-gray-900 dark:text-white/90">
          {o.label}
        </option>
      ))}
    </select>
  );
}
