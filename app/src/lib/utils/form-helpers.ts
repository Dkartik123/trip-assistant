import type React from "react";

/**
 * Check if an object has any non-empty string values.
 */
export function hasValues(obj: object): boolean {
  return Object.values(obj).some((v) => typeof v === "string" && v.trim());
}

/**
 * Update a single field in an item at a given index in a state array.
 */
export function updateItem<T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  idx: number,
  field: keyof T,
  value: string,
): void {
  setter((prev) => {
    const next = [...prev];
    next[idx] = { ...next[idx], [field]: value } as T;
    return next;
  });
}
