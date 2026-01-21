"use client"

/**
 * 에디터 UI 상태 관리 전용 훅
 *
 * 선택 상태, 패널 열림/닫힘, Ghost 노드 등 UI 상태를 담당
 */

import { useState, useCallback } from "react"
import {
  type Selection,
  type EditorUIState,
  type PendingAddType,
  INITIAL_UI_STATE,
} from "@/types/editor"

/**
 * useEditorUI 훅 반환 타입
 */
export interface UseEditorUIReturn {
  /** UI 상태 */
  uiState: EditorUIState
  /** 선택 상태 설정 */
  setSelection: (selection: Selection) => void
  /** 우측 패널 토글 */
  toggleRightPanel: () => void
  /** 우측 패널 닫기 */
  closeRightPanel: () => void
  /** 연결 모드 토글 */
  toggleConnecting: () => void
  /** Export 모달 토글 */
  toggleExportModal: () => void
  /** 노드 추가 대기 모드 시작 (Ghost 노드) */
  startPendingAdd: (type: PendingAddType) => void
  /** 노드 추가 대기 모드 취소 */
  cancelPendingAdd: () => void
  /** Ghost 노드용 마우스 위치 업데이트 */
  updateMousePosition: (position: { x: number; y: number } | null) => void
  /** 초기 상태로 리셋 */
  resetUIState: () => void
}

/**
 * 에디터 UI 상태 관리 전용 훅
 *
 * 선택 상태, 패널 열림/닫힘, 연결 모드, Ghost 노드 등을 관리합니다.
 */
export function useEditorUI(): UseEditorUIReturn {
  const [uiState, setUIState] = useState<EditorUIState>(INITIAL_UI_STATE)

  /**
   * 선택 상태 설정
   */
  const setSelection = useCallback((selection: Selection) => {
    setUIState((prev) => ({
      ...prev,
      selection,
      isRightPanelOpen: selection.id !== null,
    }))
  }, [])

  /**
   * 우측 패널 토글
   */
  const toggleRightPanel = useCallback(() => {
    setUIState((prev) => ({ ...prev, isRightPanelOpen: !prev.isRightPanelOpen }))
  }, [])

  /**
   * 우측 패널 닫기
   */
  const closeRightPanel = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      isRightPanelOpen: false,
      selection: { type: null, id: null },
    }))
  }, [])

  /**
   * 연결 모드 토글
   */
  const toggleConnecting = useCallback(() => {
    setUIState((prev) => ({ ...prev, isConnecting: !prev.isConnecting }))
  }, [])

  /**
   * Export 모달 토글
   */
  const toggleExportModal = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      isExportModalOpen: !prev.isExportModalOpen,
    }))
  }, [])

  /**
   * 노드 추가 대기 모드 시작 (Ghost 노드 미리보기)
   */
  const startPendingAdd = useCallback((type: PendingAddType) => {
    setUIState((prev) => ({
      ...prev,
      pendingAdd: type,
      mousePosition: null,
    }))
  }, [])

  /**
   * 노드 추가 대기 모드 취소
   */
  const cancelPendingAdd = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      pendingAdd: null,
      mousePosition: null,
    }))
  }, [])

  /**
   * Ghost 노드용 마우스 위치 업데이트
   */
  const updateMousePosition = useCallback(
    (position: { x: number; y: number } | null) => {
      setUIState((prev) => ({
        ...prev,
        mousePosition: position,
      }))
    },
    []
  )

  /**
   * 초기 상태로 리셋
   */
  const resetUIState = useCallback(() => {
    setUIState(INITIAL_UI_STATE)
  }, [])

  return {
    uiState,
    setSelection,
    toggleRightPanel,
    closeRightPanel,
    toggleConnecting,
    toggleExportModal,
    startPendingAdd,
    cancelPendingAdd,
    updateMousePosition,
    resetUIState,
  }
}
