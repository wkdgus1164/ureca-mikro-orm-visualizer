/**
 * 코드 생성 공통 유틸리티
 *
 * 들여쓰기, 이름 정리 등 코드 생성에 공통으로 사용되는 함수들
 */

/**
 * 코드 생성 옵션
 */
export interface GeneratorOptions {
  /** 들여쓰기 크기 (스페이스 수) */
  indentSize?: number
  /** Collection import 경로 */
  collectionImport?: string
}

export const DEFAULT_OPTIONS: GeneratorOptions = {
  indentSize: 2,
  collectionImport: "@mikro-orm/core",
}

/**
 * Create a string of spaces representing indentation for a given level and size.
 *
 * @param level - The indentation level (number of indent steps)
 * @param size - Number of spaces per indent level (default: 2)
 * @returns A string containing `level * size` space characters
 */
export function indent(level: number, size: number = 2): string {
  return " ".repeat(level * size)
}

/**
 * Sanitizes a class name to produce a valid TypeScript identifier.
 *
 * 1. Replaces all non-alphanumeric characters (except underscores) with underscores
 * 2. Collapses consecutive underscores into a single underscore
 * 3. Removes leading and trailing underscores
 * 4. Prepends an underscore if the result is empty or starts with a digit
 *
 * @param name - The class name to sanitize
 * @returns A valid TypeScript identifier
 */
export function sanitizeClassName(name: string): string {
  // 1. 알파벳, 숫자, 언더스코어가 아닌 문자는 언더스코어로 대체
  let sanitized = name.replace(/[^A-Za-z0-9_]/g, "_")
  // 2. 연속된 언더스코어를 하나로 합침
  sanitized = sanitized.replace(/_+/g, "_")
  // 3. 앞뒤 언더스코어 제거
  sanitized = sanitized.replace(/^_+|_+$/g, "")
  // 4. 결과가 비어있거나 숫자로 시작하면 앞에 언더스코어 추가
  if (sanitized === "" || /^[0-9]/.test(sanitized)) {
    sanitized = "_" + sanitized
  }
  return sanitized
}
