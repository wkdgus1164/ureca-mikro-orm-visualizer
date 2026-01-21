# hooks/

커스텀 React 훅 디렉토리.

## 구조

```
hooks/
├── use-editor.ts       # 에디터 통합 훅 (메인 인터페이스)
├── use-nodes.ts        # 노드 CRUD 관리 (제네릭 패턴)
├── use-edges.ts        # 엣지 CRUD 관리 (Relationship)
└── use-editor-ui.ts    # UI 상태 관리 (선택, 패널, Ghost 노드)
```

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        use-editor.ts                        │
│                    (통합 인터페이스 제공)                    │
├─────────────────┬─────────────────┬─────────────────────────┤
│  use-nodes.ts   │  use-edges.ts   │    use-editor-ui.ts     │
│  (노드 CRUD)    │  (엣지 CRUD)    │    (UI 상태 관리)       │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 파일 설명

### use-editor.ts (메인 진입점)

에디터 전역 상태를 관리하는 통합 훅. 하위 훅들을 조합하여 단일 인터페이스 제공.

```typescript
import { useEditor } from "@/hooks/use-editor"

const {
  // 노드 관련
  nodes, addEntity, updateEntity, deleteEntity,
  addEmbeddable, updateEmbeddable, deleteEmbeddable,
  addEnum, updateEnum, deleteEnum, getAllEnums,

  // 엣지 관련
  edges, onConnect, updateRelationship, deleteRelationship,

  // UI 상태
  uiState, setSelection, toggleRightPanel, closeRightPanel,
  toggleConnecting, toggleExportModal,

  // Getter
  getSelectedNode, getSelectedEnum, getSelectedEdge,

  // 다이어그램 작업
  loadDiagram, clearDiagram,

  // Ghost 노드 (Pending Add)
  startPendingAdd, cancelPendingAdd, updateMousePosition, finalizePendingAdd,
} = useEditor()
```

**책임:**
- 하위 훅 조합 및 통합 인터페이스 제공
- 노드 삭제 시 관련 엣지 자동 삭제
- Pending Add 완료 (Ghost 노드 → 실제 노드 변환)
- 선택 상태 getter 메서드

### use-nodes.ts (노드 관리)

Entity, Embeddable, Enum 노드의 CRUD 작업을 담당. **제네릭 패턴**으로 중복 최소화.

```typescript
import { useNodes } from "@/hooks/use-nodes"

const {
  nodes, setNodes, onNodesChange,
  addEntity, addEmbeddable, addEnum,
  updateEntity, updateEmbeddable, updateEnum,
  deleteNode, getAllEnums,
} = useNodes()
```

**내부 구조:**

```typescript
// 노드 타입별 설정 (제네릭 패턴)
const NODE_CONFIGS = {
  entity: { type: "entity", baseName: "NewEntity", factory: createDefaultEntity },
  embeddable: { type: "embeddable", baseName: "NewEmbeddable", factory: createDefaultEmbeddable },
  enum: { type: "enum", baseName: "NewEnum", factory: createDefaultEnum },
}

// 제네릭 노드 추가 함수
const addNode = <T extends FlowNode>(config: NodeConfig<T>, position?) => { ... }

// 제네릭 노드 업데이트 함수
const updateNode = <T extends NodeData>(id: string, data: Partial<T>) => { ... }

// 타입별 래퍼 (외부 인터페이스 유지)
const addEntity = (position?) => addNode(NODE_CONFIGS.entity, position)
const addEmbeddable = (position?) => addNode(NODE_CONFIGS.embeddable, position)
const addEnum = (position?) => addNode(NODE_CONFIGS.enum, position)
```

**책임:**
- 노드 추가 (고유 이름 자동 생성)
- 노드 업데이트 (부분 데이터 병합)
- 노드 삭제
- 특정 타입 노드 조회 (getAllEnums)

### use-edges.ts (엣지 관리)

Relationship 엣지의 CRUD 작업을 담당.

```typescript
import { useEdges } from "@/hooks/use-edges"

const {
  edges, setEdges, onEdgesChange,
  onConnect, updateRelationship,
  deleteRelationship, deleteEdgesByNodeId,
} = useEdges()
```

**책임:**
- 새 연결 생성 (onConnect)
- Relationship 데이터 업데이트
- 엣지 삭제
- 노드 삭제 시 관련 엣지 일괄 삭제

### use-editor-ui.ts (UI 상태)

UI 상태 관리 (선택, 패널 열림/닫힘, Ghost 노드 등).

```typescript
import { useEditorUI } from "@/hooks/use-editor-ui"

const {
  uiState,
  setSelection, toggleRightPanel, closeRightPanel,
  toggleConnecting, toggleExportModal,
  startPendingAdd, cancelPendingAdd, updateMousePosition,
} = useEditorUI()
```

**UI 상태 구조:**

```typescript
interface EditorUIState {
  selection: Selection              // 선택된 노드/엣지
  isRightPanelOpen: boolean         // 우측 패널 열림
  isConnecting: boolean             // 연결 모드
  isExportModalOpen: boolean        // Export 모달 열림
  pendingAdd: PendingAddType | null // Ghost 노드 타입
  mousePosition: { x: number; y: number } | null // 마우스 위치
}
```

**책임:**
- 선택 상태 관리
- 패널 열림/닫힘 토글
- 연결 모드 토글
- Export 모달 토글
- Ghost 노드 (Pending Add) 상태 관리

## 훅 작성 규칙

1. 파일명은 `use-[name].ts` 형식
2. 훅 함수명은 `use`로 시작
3. 클라이언트 전용 훅은 `"use client"` 선언
4. 단일 책임 원칙 준수
5. 타입 안전성 유지 (`any` 금지)
6. 반환 타입 인터페이스 정의 (예: `UseNodesReturn`)

## 타입 정의

### FlowNode

```typescript
export type FlowNode = (EntityNode | EmbeddableNode | EnumNode) & {
  selected?: boolean
  dragging?: boolean
}
```

### FlowEdge

```typescript
export type FlowEdge = RelationshipEdge & {
  selected?: boolean
}
```

## 테스트

훅 테스트는 `test/hooks/` 디렉토리에 위치:

```bash
bun run test test/hooks/use-editor.test.ts
```

**테스트 커버리지:**
- 50개 테스트 케이스
- 노드 CRUD, 엣지 CRUD, UI 상태, Ghost 노드 등
