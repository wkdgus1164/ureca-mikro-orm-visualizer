/**
 * AI 채팅 관련 타입 정의
 *
 * Tool 실행 결과, 채팅 메시지 확장 타입 등
 */

/**
 * Tool 실행 결과 타입
 */
export type ToolResultType =
  | "entityCreated"
  | "entityUpdated"
  | "entityDeleted"
  | "embeddableCreated"
  | "embeddableUpdated"
  | "embeddableDeleted"
  | "enumCreated"
  | "enumUpdated"
  | "enumDeleted"
  | "interfaceCreated"
  | "interfaceUpdated"
  | "interfaceDeleted"
  | "propertyAdded"
  | "propertyUpdated"
  | "propertyDeleted"
  | "relationshipCreated"
  | "relationshipUpdated"
  | "relationshipDeleted"
  | "enumMappingCreated"
  | "enumMappingDeleted"
  | "diagramCleared"
  | "diagramSummary"
  | "codeGenerated"
  | "codePreview"
  | "askUserPending"
  | "askUserResponse"
  | "error"

/**
 * Entity 생성 결과 데이터
 */
export interface EntityCreatedData {
  name: string
  propertyCount: number
}

/**
 * Entity 수정 결과 데이터
 */
export interface EntityUpdatedData {
  name: string
  changes: string[]
}

/**
 * Entity 삭제 결과 데이터
 */
export interface EntityDeletedData {
  name: string
}

/**
 * Relationship 생성 결과 데이터
 */
export interface RelationshipCreatedData {
  source: string
  target: string
  type: string
}

/**
 * Property 추가 결과 데이터
 */
export interface PropertyAddedData {
  nodeName: string
  propertyName: string
  propertyType: string
}

/**
 * Enum 생성 결과 데이터
 */
export interface EnumCreatedData {
  name: string
  valueCount: number
}

/**
 * Enum Mapping 생성 결과 데이터
 */
export interface EnumMappingCreatedData {
  entityName: string
  propertyName: string
  enumName: string
}

/**
 * 다이어그램 요약 데이터
 */
export interface DiagramSummaryData {
  entityCount: number
  embeddableCount: number
  enumCount: number
  interfaceCount: number
  relationshipCount: number
  enumMappingCount: number
}

/**
 * 코드 생성 결과 데이터
 */
export interface CodeGeneratedData {
  target: string
  fileCount: number
}

/**
 * 코드 미리보기 데이터
 */
export interface CodePreviewData {
  nodeName: string
  code: string
}

/**
 * 에러 데이터
 */
export interface ErrorData {
  message: string
}

/**
 * 사용자 질문 옵션
 */
export interface AskUserOption {
  value: string
  label: string
  description?: string
}

/**
 * 사용자 질문 데이터 (대기 중)
 */
export interface AskUserPendingData {
  toolCallId: string
  question: string
  type: "text" | "single-choice" | "multiple-choice"
  options?: AskUserOption[]
  defaultValue?: string
}

/**
 * 사용자 응답 데이터
 */
export interface AskUserResponseData {
  question: string
  response: string | string[]
}

/**
 * Tool 실행 결과
 */
export interface ToolResult {
  type: ToolResultType
  data:
    | EntityCreatedData
    | EntityUpdatedData
    | EntityDeletedData
    | RelationshipCreatedData
    | PropertyAddedData
    | EnumCreatedData
    | EnumMappingCreatedData
    | DiagramSummaryData
    | CodeGeneratedData
    | CodePreviewData
    | AskUserPendingData
    | AskUserResponseData
    | ErrorData
    | Record<string, unknown>
}

/**
 * 채팅 메시지 확장 타입
 */
export interface ChatMessageExtension {
  toolResults?: ToolResult[]
}

/**
 * 채팅 스레드 메타데이터
 */
export interface ChatThreadMeta {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messageCount: number
}

/**
 * 채팅 스레드 (메시지 포함)
 */
export interface ChatThread extends ChatThreadMeta {
  messages: unknown[] // AI SDK Message 타입
}
