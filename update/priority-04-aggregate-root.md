# Priority 04: Aggregate Root 추가

## 개요
DDD(Domain-Driven Design)의 핵심 개념인 Aggregate Root를 노드 타입으로 추가합니다. Entity와 코드 생성은 동일하며, 시각적 표기만 `<<Root>>`로 구분됩니다.

**난이도:** 중간
**병렬 처리:** 가능 (노드, 툴바, 훅은 독립적)
**기존 코드 영향:** 중간 (NodeKind 확장, 노드 컴포넌트 추가)

---

## 영향받는 컴포넌트

| 컴포넌트 | 변경 사항 |
|---------|----------|
| ✅ 사이드 메뉴 | **Root 노드 추가 버튼** |
| ✅ 캔버스 | **`<<Root>>` 스테레오 타입 노드 렌더링** |
| ✅ 프로퍼티 설정 사이드바 | 영향 없음 (Entity와 동일한 폼 사용) |
| ✅ Export Code | 영향 없음 (Entity와 동일한 `@Entity()` 생성) |

---

## 개념 정리

| 노드 타입 | 스테레오 타입 | 설명 | 코드 생성 |
|---------|-------------|------|----------|
| **Root** | `<<Root>>` | Aggregate의 진입점, Repository를 통해 조회 | `@Entity()` |
| **Entity** | `<<Entity>>` | Root에 종속된 엔티티 | `@Entity()` |

**핵심:**
- Root와 Entity는 **코드는 동일**, **시각적 표기만 다름**
- 개발자가 도메인 모델링 시 Aggregate 경계를 구분하기 위한 용도

---

## 구체적인 작업 항목

### 1. 타입 정의 (`types/entity.ts`)

**작업:**
```typescript
// NodeKind에 "root" 추가
export type NodeKind = "entity" | "embeddable" | "enum" | "root" // "root" 추가

// RootNode 타입 정의
export interface RootNode extends Node {
  type: "root"
  data: EntityData // Entity와 동일한 데이터 구조
}

// DiagramNode 타입에 RootNode 추가
export type DiagramNode = EntityNode | EmbeddableNode | EnumNode | RootNode
```

**파일:** `types/entity.ts`
**라인:**
- NodeKind: 약 157
- RootNode: 새로운 인터페이스 추가 (EntityNode 옆)
- DiagramNode: 약 180

---

### 2. Root 노드 컴포넌트 (`components/editor/nodes/root-node.tsx`)

**작업:**
- Entity 노드와 거의 동일하지만 스테레오 타입만 `<<Root>>`

**구현:**
```tsx
// components/editor/nodes/root-node.tsx (신규 파일)

import type { NodeProps } from "@xyflow/react"
import { Crown } from "lucide-react"
import type { EntityData } from "@/types/entity"
import { NodeCard } from "./shared/node-card"
import { NodeHeader } from "./shared/node-header"
import { NodeHandles } from "./shared/node-handles"
import { PropertyList } from "./shared/property-list"

export function RootNode({ id, data, selected }: NodeProps<EntityData>) {
  return (
    <NodeCard id={data.id} kind="root" selected={selected}>
      <NodeHeader>
        <div className="flex flex-col gap-1">
          {/* 스테레오 타입 */}
          <div className="text-xs text-muted-foreground font-mono">
            &lt;&lt;Root&gt;&gt;
          </div>
          {/* 헤더 */}
          <div className="flex items-center gap-2">
            <Crown className="size-4" /> {/* 왕관 아이콘 */}
            <h3 className="font-semibold text-sm">{data.name}</h3>
          </div>
        </div>
      </NodeHeader>

      {/* 속성 리스트 (Entity와 동일) */}
      <PropertyList properties={data.properties} />

      <NodeHandles />
    </NodeCard>
  )
}

RootNode.displayName = "RootNode"
```

**파일:** `components/editor/nodes/root-node.tsx` (신규)
**아이콘:** `Crown` (왕관) - Aggregate의 "Root"를 상징

---

### 3. 노드 타입 등록 (`components/editor/canvas/editor-canvas.tsx`)

**작업:**
- ReactFlow의 `nodeTypes`에 `root` 추가

**구현:**
```tsx
// components/editor/canvas/editor-canvas.tsx

import { RootNode } from "@/components/editor/nodes/root-node"

const nodeTypes = {
  entity: EntityNode,
  embeddable: EmbeddableNode,
  enum: EnumNode,
  root: RootNode, // 추가
}
```

**파일:** `components/editor/canvas/editor-canvas.tsx`
**라인:** nodeTypes 정의 부분

---

### 4. 툴바에 Root 추가 버튼 (`components/editor/toolbar/add-node-buttons.tsx`)

**작업:**
- Root 노드 추가 버튼

**구현:**
```tsx
// components/editor/toolbar/add-node-buttons.tsx

import { Crown } from "lucide-react"

// Root 버튼 추가
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    addNode("root", {
      id: generateId(),
      name: "NewRoot",
      properties: [],
      tableName: "",
    })
  }}
>
  <Crown className="mr-2 size-4" />
  Root
</Button>
```

**파일:** `components/editor/toolbar/add-node-buttons.tsx`
**위치:** Entity 버튼 옆

---

### 5. 훅 수정 (`hooks/use-nodes.ts`)

**작업:**
- `addNode` 함수에서 `"root"` 타입 처리

**구현:**
```typescript
// hooks/use-nodes.ts

export function useNodes() {
  const addNode = useCallback(
    (kind: NodeKind, data: EntityData | EmbeddableData | EnumData) => {
      const newNode = {
        id: generateId(),
        type: kind, // "root"도 자동 처리됨
        position: { x: 100, y: 100 },
        data,
      }
      setNodes((nodes) => [...nodes, newNode])
    },
    [setNodes]
  )

  // ...
}
```

**파일:** `hooks/use-nodes.ts`
**함수:** `addNode` - 특별한 수정 없이 `kind`가 `"root"`일 때도 동작

---

### 6. 코드 생성 로직 (수정 없음)

**현재 상태:**
- `lib/mikro-orm/generators/entity.ts`는 `EntityData`를 받아 `@Entity()` 생성
- Root도 `EntityData`를 사용하므로 **수정 불필요**

**확인:**
```typescript
// lib/mikro-orm/generators/entity.ts

// Root든 Entity든 동일하게 @Entity() 생성
export function generateEntityClass(node: EntityNode | RootNode): string {
  return `
@Entity()
export class ${node.data.name} {
  // ...
}
  `
}
```

**파일:** `lib/mikro-orm/generators/entity.ts` - **수정 없음**

---

## 병렬 처리 전략

**순차적 작업:**
1. 타입 정의 (`types/entity.ts`) - **먼저 완료 필요**

**병렬 처리 가능:**
2. Root 노드 컴포넌트 (`root-node.tsx`)
3. 노드 타입 등록 (`editor-canvas.tsx`)
4. 툴바 버튼 (`add-node-buttons.tsx`)
5. 훅 확인 (`use-nodes.ts`)

**서브 에이전트 할당 제안:**
- Agent 1: 타입 정의 → Root 노드 컴포넌트
- Agent 2: 툴바 버튼 → 노드 타입 등록

---

## 기존 코드에 영향을 주지 않는 방법

1. **기존 NodeKind는 그대로 유지**
   - `"root"`는 추가만, 기존 `"entity"`, `"embeddable"`, `"enum"`은 변경 없음

2. **코드 생성 로직은 수정 불필요**
   - Root도 `EntityData`를 사용하므로 기존 생성기가 그대로 동작

3. **노드 스타일은 NodeCard 재사용**
   - `kind="root"`만 전달하여 기존 스타일링 시스템 활용

---

## 완료 조건

- [ ] `types/entity.ts`에 `"root"` NodeKind 추가
- [ ] `types/entity.ts`에 `RootNode` 인터페이스 추가
- [ ] `components/editor/nodes/root-node.tsx` 생성
- [ ] `editor-canvas.tsx`에 `root: RootNode` 등록
- [ ] `add-node-buttons.tsx`에 Root 버튼 추가
- [ ] `use-nodes.ts`에서 Root 노드 생성 동작 확인
- [ ] Root 노드 렌더링 테스트
- [ ] `bun run lint` 통과
- [ ] `bun run build` 성공

---

## 예상 소요 시간

- 타입 정의: 10분
- Root 노드 컴포넌트: 20분
- 노드 타입 등록: 5분
- 툴바 버튼: 10분
- 훅 확인: 5분
- 테스트: 15분
- **총 예상 시간: 1시간 5분**

---

## 시각적 변경 사항

**Root 노드:**
```
┌─────────────────┐
│ <<Root>>        │
│ 👑 Order        │
│─────────────────│
│ + id: number    │
│ + total: number │
└─────────────────┘
```

**Entity 노드:**
```
┌─────────────────┐
│ <<Entity>>      │
│ 🔷 OrderItem    │
│─────────────────│
│ + id: number    │
│ + qty: number   │
└─────────────────┘
```

**도메인 모델 예시:**
```
[Order (Root)] ◆────→ [OrderItem (Entity)]
[User (Root)] ◇────→ [Address (Entity)]
```
