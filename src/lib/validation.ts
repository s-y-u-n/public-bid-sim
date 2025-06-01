// src/lib/validation.ts

/**
 * UUID v4 形式の判定（超簡易判定）
 */
export function isValidUUID(str: string): boolean {
  const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof str === "string" && uuidV4Pattern.test(str);
}