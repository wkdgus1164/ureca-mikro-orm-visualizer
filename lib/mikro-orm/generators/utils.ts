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
 * Replace all whitespace in a class name with underscores to produce a sanitized identifier.
 *
 * @param name - The class name to sanitize
 * @returns The sanitized class name with all whitespace replaced by underscores
 */
export function sanitizeClassName(name: string): string {
  return name.replace(/\s+/g, "_")
}
