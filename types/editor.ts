/**
 * 에디터 상태 관련 타입 정의
 *
 * ReactFlow 기반 비주얼 에디터의 전역 상태 타입들
 */

import type { EntityNode } from "./entity"
import type { RelationshipEdge } from "./relationship"

/**
 * 에디터 전역 상태
 *
 * ReactFlow의 노드/엣지 상태를 관리하는 기본 인터페이스
 */
export interface EditorState {
  /** Entity 노드 목록 */
  nodes: EntityNode[]
  /** Relationship 엣지 목록 */
  edges: RelationshipEdge[]
}

/**
 * 선택 상태 타입
 */
export type SelectionType = "node" | "edge" | null

/**
 * 추가 대기 중인 노드 타입
 * Ghost 노드 미리보기에서 사용
 */
export type PendingAddType = "entity" | "embeddable" | "enum" | "interface" | null

/**
 * 현재 선택된 요소 정보
 */
export interface Selection {
  /** 선택된 요소 타입 */
  type: SelectionType
  /** 선택된 요소 ID (노드 또는 엣지) */
  id: string | null
}

/**
 * 에디터 UI 상태
 */
export interface EditorUIState {
  /** 현재 선택된 요소 */
  selection: Selection
  /** 우측 Property 패널 열림 여부 */
  isRightPanelOpen: boolean
  /** Relationship 연결 모드 여부 */
  isConnecting: boolean
  /** Export 모달 열림 여부 */
  isExportModalOpen: boolean
  /** 추가 대기 모드 (Ghost 노드 미리보기) */
  pendingAdd: PendingAddType
  /** Ghost 노드용 마우스 위치 (flow 좌표) */
  mousePosition: { x: number; y: number } | null
}

/**
 * 에디터 액션 타입
 */
export enum EditorActionType {
  /** 노드 추가 */
  ADD_NODE = "ADD_NODE",
  /** 노드 업데이트 */
  UPDATE_NODE = "UPDATE_NODE",
  /** 노드 삭제 */
  DELETE_NODE = "DELETE_NODE",
  /** 엣지 추가 */
  ADD_EDGE = "ADD_EDGE",
  /** 엣지 업데이트 */
  UPDATE_EDGE = "UPDATE_EDGE",
  /** 엣지 삭제 */
  DELETE_EDGE = "DELETE_EDGE",
  /** 선택 변경 */
  SET_SELECTION = "SET_SELECTION",
  /** 전체 상태 초기화 */
  RESET = "RESET",
}

/**
 * 뷰포트 상태
 */
export interface ViewportState {
  /** X 좌표 오프셋 */
  x: number
  /** Y 좌표 오프셋 */
  y: number
  /** 줌 레벨 (1 = 100%) */
  zoom: number
}

/**
 * 에디터 설정
 */
export interface EditorConfig {
  /** 미니맵 표시 여부 */
  showMinimap: boolean
  /** 컨트롤 패널 표시 여부 */
  showControls: boolean
  /** 배경 그리드 표시 여부 */
  showBackground: boolean
  /** 스냅 투 그리드 활성화 여부 */
  snapToGrid: boolean
  /** 그리드 크기 (픽셀) */
  gridSize: number
}

/**
 * 기본 에디터 설정
 */
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  showMinimap: true,
  showControls: true,
  showBackground: true,
  snapToGrid: true,
  gridSize: 20,
}

/**
 * 초기 에디터 상태
 */
export const INITIAL_EDITOR_STATE: EditorState = {
  nodes: [],
  edges: [],
}

/**
 * 초기 UI 상태
 */
export const INITIAL_UI_STATE: EditorUIState = {
  selection: {
    type: null,
    id: null,
  },
  isRightPanelOpen: false,
  isConnecting: false,
  isExportModalOpen: false,
  pendingAdd: null,
  mousePosition: null,
}
