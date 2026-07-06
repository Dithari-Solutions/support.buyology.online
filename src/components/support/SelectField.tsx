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
      className={`h-11 w-full appearance-none rounded-xl border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs focus:border-accent-400 focus:outline-hidden focus:ring-3 focus:ring-accent-500/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/90 dark:focus:border-accent-500/60 ${
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
