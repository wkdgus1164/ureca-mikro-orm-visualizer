# components/

재사용 가능한 React 컴포넌트 디렉토리.

## 구조

```text
components/
├── ui/                              # shadcn/ui 컴포넌트
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── providers/                       # Context Provider 컴포넌트
│   ├── theme-provider.tsx           # 다크모드 Provider
│   └── editor-provider.tsx          # 에디터 상태 Provider
├── editor/                          # 에디터 전용 컴포넌트
│   ├── editor-layout.tsx            # 에디터 레이아웃 (3-패널)
│   ├── canvas/
│   │   └── editor-canvas.tsx        # ReactFlow 캔버스 래퍼
│   ├── nodes/                       # 커스텀 노드 컴포넌트
│   │   ├── entity-node.tsx          # Entity 노드
│   │   ├── embeddable-node.tsx      # Embeddable 노드
│   │   ├── enum-node.tsx            # Enum 노드
│   │   ├── ghost-node.tsx           # Ghost 노드 (추가 대기)
│   │   └── shared/                  # 노드 공통 컴포넌트
│   │       ├── node-handles.tsx     # 4방향 핸들
│   │       ├── node-card.tsx        # 카드 레이아웃
│   │       └── index.ts
│   ├── edges/                       # 커스텀 엣지 컴포넌트
│   │   ├── relationship-edge.tsx    # Relationship 엣지
│   │   └── shared/                  # 엣지 공통 컴포넌트
│   │       ├── edge-markers.tsx     # SVG 마커 정의
│   │       └── index.ts
│   ├── toolbar/
│   │   ├── editor-toolbar.tsx       # 메인 툴바
│   │   └── zoom-slider.tsx          # 줌 슬라이더
│   └── panels/                      # 사이드 패널 컴포넌트
│       ├── node-list-panel.tsx      # 좌측 노드 목록
│       ├── property-sidebar.tsx     # 우측 속성 패널
│       ├── entity-edit-panel.tsx    # Entity 편집 패널
│       ├── enum-edit-panel.tsx      # Enum 편집 패널
│       ├── relationship-edit-panel.tsx  # Relationship 편집 패널
│       ├── property-form.tsx        # Property 편집 폼
│       ├── inline-enum-form.tsx     # 인라인 Enum 편집
│       ├── property-type-selector.tsx   # 타입 선택기
│       ├── index-form.tsx           # Index 편집 폼
│       └── shared/                  # 패널 공통 컴포넌트
│           ├── node-list-item.tsx   # 노드 목록 아이템
│           ├── category-section.tsx # 접을 수 있는 섹션
│           └── index.ts
└── export/                          # 내보내기 컴포넌트
    ├── export-modal.tsx             # Export 모달 (메인)
    ├── export-modal-wrapper.tsx     # Export 모달 래퍼
    ├── typescript-export-tab.tsx    # TypeScript 코드 탭
    ├── json-export-tab.tsx          # JSON Schema 탭
    └── image-export-tab.tsx         # 이미지 탭
```

## 아키텍처

```text
┌────────────────────────────────────────────────────────────────┐
│                      EditorProvider                            │
│  (useEditor 훅 기반 전역 상태: nodes, edges, uiState)          │
├────────────────────────────────────────────────────────────────┤
│                      EditorLayout                              │
├────────────┬─────────────────────────┬─────────────────────────┤
│ NodeList   │     EditorCanvas        │   PropertySidebar       │
│ Panel      │  (ReactFlow + Nodes)    │  (EntityEditPanel 등)   │
│ (좌측)     │      (중앙)              │       (우측)             │
└────────────┴─────────────────────────┴─────────────────────────┘
```

## 디렉토리 설명

### ui/

shadcn/ui CLI로 생성된 UI 컴포넌트. 직접 수정하지 않고 래핑하거나 확장.

```bash
bunx shadcn@latest add [component-name]
```

### providers/

앱 전체에 걸쳐 상태나 기능을 제공하는 Provider 컴포넌트.

| 파일 | 역할 |
|-----|------|
| `theme-provider.tsx` | next-themes 기반 다크모드 |
| `editor-provider.tsx` | 에디터 전역 상태 (useEditor 훅 기반) |

### editor/nodes/

ReactFlow 커스텀 노드 컴포넌트.

| 파일 | 역할 |
|-----|------|
| `entity-node.tsx` | Entity 노드 (파란색 테마) |
| `embeddable-node.tsx` | Embeddable 노드 (보라색 테마, 점선) |
| `enum-node.tsx` | Enum 노드 (amber 테마) |
| `ghost-node.tsx` | 추가 대기 중 Ghost 노드 |

#### editor/nodes/shared/

노드 컴포넌트에서 공통으로 사용하는 컴포넌트.

| 파일 | 역할 | 사용처 |
|-----|------|-------|
| `node-handles.tsx` | 4방향 연결 핸들 래퍼 | 모든 노드 |
| `node-card.tsx` | 노드 카드 레이아웃 (헤더/바디) | 모든 노드 |

**사용 예시:**

```typescript
import { NodeHandles } from "@/components/editor/nodes/shared/node-handles"
import { NodeCard, NodeCardHeader, NodeCardBody } from "@/components/editor/nodes/shared/node-card"

function MyNode({ data, selected }) {
  return (
    <NodeHandles theme="primary">
      <NodeCard
        theme="entity"
        selected={selected}
        header={<NodeCardHeader icon={<Box />} title={data.name} />}
      >
        <NodeCardBody isEmpty={data.items.length === 0}>
          {/* 내용 */}
        </NodeCardBody>
      </NodeCard>
    </NodeHandles>
  )
}
```

### editor/edges/

ReactFlow 커스텀 엣지 컴포넌트.

| 파일 | 역할 |
|-----|------|
| `relationship-edge.tsx` | Relationship 엣지 (마커 + 라벨) |

#### editor/edges/shared/

엣지 컴포넌트에서 공통으로 사용하는 컴포넌트.

| 파일 | 역할 |
|-----|------|
| `edge-markers.tsx` | SVG 마커 정의 (화살표, 까마귀발, 수직선) |

**마커 사용 방법:**

마커는 `GlobalEdgeMarkers` 컴포넌트를 통해 캔버스 레벨에서 한 번만 렌더링됩니다.
개별 엣지 컴포넌트에서는 `MARKER_IDS`를 통해 마커 ID만 참조합니다.

```typescript
// 엣지 컴포넌트에서 마커 참조
import { MARKER_IDS } from "@/components/editor/edges/shared"

<BaseEdge markerEnd={`url(#${MARKER_IDS.arrow})`} />
```

**관련 파일:**
- `GlobalEdgeMarkers`: `components/editor/edges/shared/edge-markers.tsx` - 캔버스에 마커 정의 렌더링
- `EdgeMarkerDefs`: `components/editor/edges/shared/edge-markers.tsx` - SVG 마커 정의
- `MARKER_IDS`: `components/editor/edges/shared/edge-markers.tsx` - 마커 ID 상수
- `BaseEdge`: ReactFlow 제공 컴포넌트 - 엣지 렌더링
- `EditorCanvas`: `components/editor/canvas/editor-canvas.tsx` - GlobalEdgeMarkers 렌더링

**주의사항 (markerStart 관련):**

ReactFlow에서 `markerStart` 사용 시 다음 문제가 있습니다:

1. **`BaseEdge`의 `markerStart` 미지원**: ReactFlow의 `BaseEdge` 컴포넌트에 `markerStart` prop을 전달해도 실제로 적용되지 않음
2. **직접 `<path>` 사용 시에도 동일**: `BaseEdge` 대신 직접 `<path>` 요소를 사용해도 `markerStart` 속성이 작동하지 않음

**해결 방법:**

source 쪽에 마커(예: Composition/Aggregation 다이아몬드)를 표시해야 하는 경우, SVG marker 대신 별도의 `<polygon>` 또는 `<circle>` 요소로 직접 그려야 합니다.

```typescript
// 다이아몬드를 직접 polygon으로 그리기
{isComposition && (
  <polygon
    points={diamondPoints}
    fill="#64748b"
  />
)}
```

**다이아몬드 방향 계산 시 주의:**

- **잘못된 방법**: `source → target` 직선 방향으로 계산하면 Bezier 곡선에서 다이아몬드 방향이 틀어짐
- **올바른 방법**: `sourcePosition` (top/bottom/left/right) 기반으로 방향 계산

```typescript
// sourcePosition 기반 방향 벡터
function getDirectionFromPosition(position: string) {
  switch (position) {
    case "right": return { ux: 1, uy: 0 }
    case "left": return { ux: -1, uy: 0 }
    case "top": return { ux: 0, uy: -1 }
    case "bottom": return { ux: 0, uy: 1 }
  }
}
```

이렇게 하면 Bezier 곡선이 어떻게 구부러지든 source에서 나가는 방향에 맞춰 다이아몬드가 정렬됩니다.

### editor/panels/

사이드 패널 컴포넌트들.

| 파일 | 역할 |
|-----|------|
| `node-list-panel.tsx` | 좌측 노드 목록 (Entity/Embeddable/Enum 그룹) |
| `property-sidebar.tsx` | 우측 속성 패널 컨테이너 |
| `entity-edit-panel.tsx` | Entity 편집 UI |
| `enum-edit-panel.tsx` | Enum 편집 UI |
| `relationship-edit-panel.tsx` | Relationship 편집 UI |
| `property-form.tsx` | Property 편집 폼 |
| `inline-enum-form.tsx` | Enum 값 편집 UI |
| `property-type-selector.tsx` | 타입 선택 드롭다운 |
| `index-form.tsx` | Index 편집 폼 |

#### editor/panels/shared/

패널 컴포넌트에서 공통으로 사용하는 컴포넌트.

| 파일 | 역할 | 사용처 |
|-----|------|-------|
| `node-list-item.tsx` | 선택 가능한 노드 목록 아이템 | NodeListPanel |
| `category-section.tsx` | 접을 수 있는 카테고리 섹션 | NodeListPanel |

**사용 예시:**

```typescript
import { NodeListItem } from "@/components/editor/panels/shared/node-list-item"
import { CategorySection } from "@/components/editor/panels/shared/category-section"

<CategorySection
  title="Entities"
  icon={<Box className="h-4 w-4 text-blue-500" />}
  count={entities.length}
  onAdd={() => handleAddEntity()}
>
  {entities.map((entity) => (
    <NodeListItem
      key={entity.id}
      name={entity.data.name}
      isSelected={isSelected(entity.id)}
      onSelect={() => handleSelect(entity.id)}
      onDelete={() => handleDelete(entity.id)}
    />
  ))}
</CategorySection>
```

### export/

내보내기 관련 컴포넌트들.

| 파일 | 역할 |
|-----|------|
| `export-modal.tsx` | 메인 Export 모달 |
| `export-modal-wrapper.tsx` | Export 모달 래퍼 (전역 상태 연결) |
| `typescript-export-tab.tsx` | TypeScript 코드 탭 |
| `json-export-tab.tsx` | JSON Schema 탭 |
| `image-export-tab.tsx` | 이미지 탭 |

## 컴포넌트 작성 규칙

1. 클라이언트 컴포넌트는 파일 상단에 `"use client"` 선언
2. Props 타입은 컴포넌트와 동일 파일에 interface로 정의
3. `cn()` 유틸리티로 className 병합 (`@/lib/utils`)
4. 한 파일에 하나의 메인 컴포넌트 (하위 컴포넌트 허용)
5. 파일명은 kebab-case, 컴포넌트명은 PascalCase
6. 공통 패턴은 `shared/` 디렉토리에 추출

```typescript
// 예시: components/editor/panels/property-form.tsx
"use client"

interface PropertyFormProps {
  property: EntityProperty
  onChange: (property: EntityProperty) => void
}

export function PropertyForm({ property, onChange }: PropertyFormProps) {
  // ...
}
```

## 테스트

컴포넌트 테스트는 `test/components/` 디렉토리에 위치:

```bash
bun run test test/components/property-form.test.tsx
bun run test test/components/export-modal.test.tsx
```
