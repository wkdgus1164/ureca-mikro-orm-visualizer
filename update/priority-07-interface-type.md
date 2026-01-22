# Priority 07: Interface 타입 추가

## 개요
TypeScript Interface 노드를 추가하여 엔티티가 구현해야 할 계약(contract)을 정의할 수 있게 합니다. Interface는 속성과 메서드 시그니처를 모두 가질 수 있습니다.

**난이도:** 높음
**병렬 처리:** 가능 (타입 정의 후 노드/UI/코드생성 병렬)
**기존 코드 영향:** 중간 (새로운 노드 타입, 새로운 데이터 구조)

---

## 영향받는 컴포넌트

| 컴포넌트 | 변경 사항 |
|---------|----------|
| ✅ 사이드 메뉴 | **Interface 노드 추가 버튼** |
| ✅ 캔버스 | **`<<Interface>>` 스테레오 타입 노드 렌더링** |
| ✅ 프로퍼티 설정 사이드바 | **Interface 편집 폼 (속성 + 메서드)** |
| ✅ Export Code | **TypeScript interface 코드 생성** |

---

## 개념 정리

**Interface가 가질 수 있는 멤버:**
1. **속성 (Properties):** `createdAt: Date`, `id: number`
2. **메서드 시그니처 (Method Signatures):** `getName(): string`, `update(data: UpdateData): void`

**예시:**
```typescript
interface IAuditable {
  // 속성
  createdAt: Date
  updatedAt: Date

  // 메서드 시그니처
  getAuditInfo(): AuditInfo
  markAsUpdated(): void
}
```

---

## 구체적인 작업 항목

### 1. 타입 정의 (`types/entity.ts`)

**작업:**
```typescript
// NodeKind에 "interface" 추가
export type NodeKind = "entity" | "embeddable" | "enum" | "root" | "interface"

// 메서드 시그니처 타입
export interface MethodSignature {
  id: string
  name: string                    // 메서드 이름 (예: "getName")
  parameters: MethodParameter[]   // 파라미터 목록
  returnType: string              // 반환 타입 (예: "string", "void")
}

export interface MethodParameter {
  name: string        // 파라미터 이름
  type: string        // 파라미터 타입
  optional?: boolean  // 선택적 파라미터 여부
}

// InterfaceData 타입
export interface InterfaceData {
  id: string
  name: string                    // 인터페이스 이름 (예: "IAuditable")
  properties: PropertyData[]      // 속성 목록
  methods: MethodSignature[]      // 메서드 시그니처 목록
}

// InterfaceNode 타입
export interface InterfaceNode extends Node {
  type: "interface"
  data: InterfaceData
}

// DiagramNode에 InterfaceNode 추가
export type DiagramNode =
  | EntityNode
  | EmbeddableNode
  | EnumNode
  | RootNode
  | InterfaceNode
```

**파일:** `types/entity.ts`
**위치:**
- MethodSignature: PropertyData 옆에 추가
- InterfaceData: EntityData 옆에 추가
- InterfaceNode: RootNode 옆에 추가

---

### 2. Interface 노드 컴포넌트 (`components/editor/nodes/interface-node.tsx`)

**작업:**
- Interface 노드 UI 생성

**구현:**
```tsx
// components/editor/nodes/interface-node.tsx (신규 파일)

import type { NodeProps } from "@xyflow/react"
import { FileCode } from "lucide-react"
import type { InterfaceData } from "@/types/entity"
import { NodeCard } from "./shared/node-card"
import { NodeHeader } from "./shared/node-header"
import { NodeHandles } from "./shared/node-handles"

export function InterfaceNode({ id, data, selected }: NodeProps<InterfaceData>) {
  return (
    <NodeCard id={data.id} kind="interface" selected={selected}>
      <NodeHeader>
        <div className="flex flex-col gap-1">
          {/* 스테레오 타입 */}
          <div className="text-xs text-muted-foreground font-mono">
            &lt;&lt;Interface&gt;&gt;
          </div>
          {/* 헤더 */}
          <div className="flex items-center gap-2">
            <FileCode className="size-4" />
            <h3 className="font-semibold text-sm italic">{data.name}</h3>
          </div>
        </div>
      </NodeHeader>

      {/* 속성 목록 */}
      {data.properties.length > 0 && (
        <div className="border-t border-border px-3 py-2">
          {data.properties.map((prop) => (
            <div key={prop.id} className="text-xs py-1">
              {prop.name}: {prop.type}
            </div>
          ))}
        </div>
      )}

      {/* 메서드 시그니처 목록 */}
      {data.methods.length > 0 && (
        <div className="border-t border-border px-3 py-2">
          {data.methods.map((method) => (
            <div key={method.id} className="text-xs py-1">
              {method.name}({method.parameters.map((p) => `${p.name}: ${p.type}`).join(", ")}): {method.returnType}
            </div>
          ))}
        </div>
      )}

      <NodeHandles />
    </NodeCard>
  )
}

InterfaceNode.displayName = "InterfaceNode"
```

**파일:** `components/editor/nodes/interface-node.tsx` (신규)
**아이콘:** `FileCode` (코드 파일)
**스타일:** 이탤릭체로 Interface 이름 표시 (UML 규칙)

---

### 3. Interface 편집 패널 (`components/editor/panels/interface-edit-panel.tsx`)

**작업:**
- Interface 속성 + 메서드 편집 폼

**구현:**
```tsx
// components/editor/panels/interface-edit-panel.tsx (신규 파일)

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { InterfaceData, MethodSignature } from "@/types/entity"

export function InterfaceEditPanel({
  data,
  onUpdate
}: {
  data: InterfaceData
  onUpdate: (data: InterfaceData) => void
}) {
  const [editedData, setEditedData] = useState(data)

  // 메서드 추가
  const addMethod = () => {
    const newMethod: MethodSignature = {
      id: generateId(),
      name: "newMethod",
      parameters: [],
      returnType: "void",
    }
    setEditedData({
      ...editedData,
      methods: [...editedData.methods, newMethod],
    })
  }

  // 메서드 삭제
  const removeMethod = (methodId: string) => {
    setEditedData({
      ...editedData,
      methods: editedData.methods.filter((m) => m.id !== methodId),
    })
  }

  return (
    <div className="space-y-4">
      {/* Interface 이름 */}
      <div className="space-y-2">
        <Label>Interface Name</Label>
        <Input
          value={editedData.name}
          onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
        />
      </div>

      {/* 속성 목록 (기존 PropertyForm 재사용) */}
      <div className="space-y-2">
        <Label>Properties</Label>
        {/* PropertyForm 컴포넌트 재사용 */}
      </div>

      {/* 메서드 목록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Methods</Label>
          <Button size="sm" variant="outline" onClick={addMethod}>
            <Plus className="size-4 mr-1" />
            Add Method
          </Button>
        </div>

        {editedData.methods.map((method) => (
          <div key={method.id} className="border rounded p-3 space-y-2">
            {/* 메서드 이름 */}
            <Input
              placeholder="Method name"
              value={method.name}
              onChange={(e) => {
                const updated = editedData.methods.map((m) =>
                  m.id === method.id ? { ...m, name: e.target.value } : m
                )
                setEditedData({ ...editedData, methods: updated })
              }}
            />

            {/* 반환 타입 */}
            <Input
              placeholder="Return type"
              value={method.returnType}
              onChange={(e) => {
                const updated = editedData.methods.map((m) =>
                  m.id === method.id ? { ...m, returnType: e.target.value } : m
                )
                setEditedData({ ...editedData, methods: updated })
              }}
            />

            {/* 파라미터 관리 - 별도 컴포넌트 */}
            {/* MethodParameterForm 컴포넌트 */}

            {/* 삭제 버튼 */}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => removeMethod(method.id)}
            >
              <Trash2 className="size-4 mr-1" />
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* 저장 버튼 */}
      <Button onClick={() => onUpdate(editedData)}>
        Save
      </Button>
    </div>
  )
}
```

**파일:** `components/editor/panels/interface-edit-panel.tsx` (신규)
**재사용:** `PropertyForm` 컴포넌트를 속성 편집에 재사용

---

### 4. 메서드 파라미터 폼 (`components/editor/panels/method-parameter-form.tsx`)

**작업:**
- 메서드 파라미터 추가/수정/삭제

**구현:**
```tsx
// components/editor/panels/method-parameter-form.tsx (신규 파일)

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import type { MethodParameter } from "@/types/entity"

export function MethodParameterForm({
  parameters,
  onChange,
}: {
  parameters: MethodParameter[]
  onChange: (parameters: MethodParameter[]) => void
}) {
  const addParameter = () => {
    onChange([
      ...parameters,
      { name: "param", type: "any", optional: false },
    ])
  }

  const removeParameter = (index: number) => {
    onChange(parameters.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Parameters</div>

      {parameters.map((param, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Name"
            value={param.name}
            onChange={(e) => {
              const updated = [...parameters]
              updated[index] = { ...param, name: e.target.value }
              onChange(updated)
            }}
          />
          <Input
            placeholder="Type"
            value={param.type}
            onChange={(e) => {
              const updated = [...parameters]
              updated[index] = { ...param, type: e.target.value }
              onChange(updated)
            }}
          />
          <Checkbox
            checked={param.optional}
            onCheckedChange={(checked) => {
              const updated = [...parameters]
              updated[index] = { ...param, optional: !!checked }
              onChange(updated)
            }}
          />
          <span className="text-xs">Optional</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => removeParameter(index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button size="sm" variant="outline" onClick={addParameter}>
        <Plus className="size-4 mr-1" />
        Add Parameter
      </Button>
    </div>
  )
}
```

**파일:** `components/editor/panels/method-parameter-form.tsx` (신규)

---

### 5. 코드 생성 로직 (`lib/mikro-orm/generators/interface.ts`)

**작업:**
- TypeScript interface 코드 생성

**구현:**
```typescript
// lib/mikro-orm/generators/interface.ts (신규 파일)

import type { InterfaceNode, MethodSignature, MethodParameter } from "@/types/entity"

export function generateInterface(node: InterfaceNode): string {
  const { name, properties, methods } = node.data

  // 속성 생성
  const propertyLines = properties.map(
    (prop) => `  ${prop.name}${prop.nullable ? "?" : ""}: ${prop.type}`
  )

  // 메서드 시그니처 생성
  const methodLines = methods.map((method) => {
    const params = method.parameters
      .map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type}`)
      .join(", ")
    return `  ${method.name}(${params}): ${method.returnType}`
  })

  // 전체 interface 생성
  return `
export interface ${name} {
${propertyLines.join("\n")}
${methodLines.join("\n")}
}
  `.trim()
}
```

**파일:** `lib/mikro-orm/generators/interface.ts` (신규)

**생성 예시:**
```typescript
export interface IAuditable {
  createdAt: Date
  updatedAt: Date

  getAuditInfo(): AuditInfo
  markAsUpdated(): void
}

export interface IRepository<T> {
  findById(id: number): Promise<T | null>
  save(entity: T): Promise<void>
  delete(id: number): Promise<boolean>
}
```

---

### 6. 노드 타입 등록 및 툴바 버튼

**노드 타입 등록:**
```tsx
// components/editor/canvas/editor-canvas.tsx
import { InterfaceNode } from "@/components/editor/nodes/interface-node"

const nodeTypes = {
  entity: EntityNode,
  embeddable: EmbeddableNode,
  enum: EnumNode,
  root: RootNode,
  interface: InterfaceNode, // 추가
}
```

**툴바 버튼:**
```tsx
// components/editor/toolbar/add-node-buttons.tsx
import { FileCode } from "lucide-react"

<Button
  variant="outline"
  size="sm"
  onClick={() => {
    addNode("interface", {
      id: generateId(),
      name: "INewInterface",
      properties: [],
      methods: [],
    })
  }}
>
  <FileCode className="mr-2 size-4" />
  Interface
</Button>
```

---

## 병렬 처리 전략

**순차적 작업:**
1. 타입 정의 (`types/entity.ts`) - **먼저 완료 필요**

**병렬 처리 가능:**
2. Interface 노드 컴포넌트 (`interface-node.tsx`)
3. Interface 편집 패널 (`interface-edit-panel.tsx`)
4. 메서드 파라미터 폼 (`method-parameter-form.tsx`)
5. 코드 생성 로직 (`interface.ts`)
6. 툴바 버튼 + 노드 등록

**서브 에이전트 할당 제안:**
- Agent 1: 타입 정의 → Interface 노드 컴포넌트 → 툴바 버튼
- Agent 2: Interface 편집 패널 → 메서드 파라미터 폼
- Agent 3: 코드 생성 로직

---

## 기존 코드에 영향을 주지 않는 방법

1. **새로운 타입 추가만**
   - 기존 NodeKind는 변경 없음

2. **독립적인 컴포넌트**
   - Interface 관련 컴포넌트는 모두 신규 파일

3. **코드 생성기 분리**
   - `interface.ts`는 별도 파일로 관리

---

## 완료 조건

- [ ] `types/entity.ts`에 Interface 관련 타입 추가
- [ ] `interface-node.tsx` 생성
- [ ] `interface-edit-panel.tsx` 생성
- [ ] `method-parameter-form.tsx` 생성
- [ ] `interface.ts` 코드 생성기 생성
- [ ] `editor-canvas.tsx`에 InterfaceNode 등록
- [ ] `add-node-buttons.tsx`에 Interface 버튼 추가
- [ ] Interface 노드 렌더링 테스트
- [ ] 코드 생성 테스트
- [ ] `bun run lint` 통과
- [ ] `bun run build` 성공

---

## 예상 소요 시간

- 타입 정의: 20분
- Interface 노드: 30분
- 편집 패널: 45분
- 파라미터 폼: 30분
- 코드 생성: 30분
- 툴바/등록: 15분
- 테스트: 30분
- **총 예상 시간: 3시간 20분**

---

## 시각적 변경 사항

**Interface 노드:**
```
┌─────────────────────────────────┐
│ <<Interface>>                   │
│ 📄 IAuditable                   │
│─────────────────────────────────│
│ createdAt: Date                 │
│ updatedAt: Date                 │
│─────────────────────────────────│
│ getAuditInfo(): AuditInfo       │
│ markAsUpdated(): void           │
└─────────────────────────────────┘
```

**사용 예시:**
```
[User (Entity)] ⋯⋯⋯▷ [IAuditable (Interface)]
[OrderRepository (Entity)] ⋯⋯⋯▷ [IRepository<Order> (Interface)]
```
