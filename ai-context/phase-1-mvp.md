# Phase 1: MVP (Minimum Viable Product)

**목표**: MikroORM 엔티티를 비주얼 에디터로 설계하고 TypeScript 코드로 내보낼 수 있는 기본 기능 구현

**예상 완료 기간**: 2-3주 (Task 단위로 점진적 완료)

---

## 진행 상황

### 기초 설정 (100%)
- [x] 프로젝트 디렉토리 구조 설계
- [x] CLAUDE.md 업데이트 (구조 강제 규칙)
- [x] ReactFlow 패키지 설치 및 기본 설정
- [x] TypeScript 타입 정의 (types/ 디렉토리)

### 비주얼 에디터 (100%)
- [x] ReactFlow 캔버스 컴포넌트 구현
- [x] Entity 노드 커스텀 컴포넌트 구현
- [x] Relationship 엣지 커스텀 컴포넌트 구현
- [x] 툴바 UI 구현 (노드 추가, 삭제 등)

### 엔티티 관리 (100%)
- [x] Entity 생성/편집/삭제 기능
- [x] Property 추가/편집/삭제 기능
- [x] Relationship 생성/편집/삭제 기능
- [x] 에디터 상태 관리 (훅)

### 코드 생성 (100%)
- [x] TypeScript 코드 생성 로직 구현
- [x] Export UI 및 다운로드 기능
- [x] 코드 미리보기 기능

---

## 핵심 목표

이 Phase의 성공 기준:
1. ✅ ReactFlow 캔버스에서 Entity 노드를 드래그앤드롭으로 배치 가능
2. ✅ Entity의 이름, 프로퍼티 (name, type, isPrimaryKey, isUnique 등) 편집 가능
3. ✅ 4가지 기본 관계 타입 (OneToOne, OneToMany, ManyToOne, ManyToMany) 연결 가능
4. ✅ 설계한 다이어그램을 MikroORM TypeScript 코드로 export 가능
5. ✅ 생성된 코드가 MikroORM 문법에 맞고 컴파일 가능

---

## 필수 기능

### 1. ReactFlow 기본 캔버스

**기능:**
- ReactFlow 라이브러리를 사용한 무한 캔버스
- 줌 인/아웃, 패닝 (드래그로 화면 이동)
- 미니맵 표시
- 컨트롤 패널 (줌, 피트 뷰, 잠금 등)

**기술 요구사항:**
- `@xyflow/react` v12 사용
- `useNodesState`, `useEdgesState` 훅으로 상태 관리
- Dark mode 지원 (next-themes 연동)

### 2. Entity 노드

**Entity 노드 구조:**
```typescript
{
  id: string                    // 고유 ID (uuid)
  type: "entity"                // 노드 타입
  position: { x: number, y: number }
  data: {
    name: string                // Entity 이름 (예: "User", "Post")
    properties: EntityProperty[]
    tableName?: string          // 커스텀 테이블명 (선택)
  }
}

interface EntityProperty {
  id: string                    // 프로퍼티 고유 ID
  name: string                  // 프로퍼티 이름 (예: "email")
  type: string                  // 타입 (string, number, boolean, Date, etc.)
  isPrimaryKey: boolean
  isUnique: boolean
  isNullable: boolean
  defaultValue?: string
}
```

**노드 UI:**
- 헤더: Entity 이름 (편집 가능)
- 바디: 프로퍼티 목록 테이블
  - 각 프로퍼티: 아이콘(PK/Unique) + 이름 + 타입
  - 프로퍼티 클릭 시 편집 모드
  - "+ Add Property" 버튼
- 핸들: 상하좌우에 연결 포인트 (관계 연결용)

**상호작용:**
- 드래그로 노드 이동
- 더블클릭으로 Entity 이름 편집
- 프로퍼티 클릭으로 프로퍼티 편집
- 우클릭 메뉴: 삭제, 복제 등

### 3. Relationship 엣지

**4가지 관계 타입:**
1. **OneToOne (1:1)**
   - 선 스타일: 실선
   - 양쪽 끝: 화살표 (←→)
   - 예: User ←→ Profile

2. **OneToMany (1:N)**
   - 선 스타일: 실선
   - 시작: 일반, 끝: 까마귀발 (crow's foot)
   - 예: User → Post (한 User가 여러 Post 작성)

3. **ManyToOne (N:1)**
   - OneToMany의 역방향

4. **ManyToMany (N:M)**
   - 선 스타일: 실선
   - 양쪽 끝: 까마귀발
   - 예: Post ←→ Tag

**Relationship 데이터 구조:**
```typescript
{
  id: string
  type: "relationship"
  source: string                // source Entity 노드 ID
  target: string                // target Entity 노드 ID
  data: {
    relationType: "OneToOne" | "OneToMany" | "ManyToOne" | "ManyToMany"
    sourceProperty: string      // source Entity의 프로퍼티명
    targetProperty?: string     // target Entity의 역방향 프로퍼티명 (양방향일 때)
    isNullable: boolean
    cascade: boolean            // cascade 옵션
    orphanRemoval: boolean      // orphanRemoval 옵션 (OneToMany/OneToOne)
  }
}
```

**엣지 UI:**
- 관계 타입에 따른 선 스타일 및 화살표
- 엣지 클릭 시 라벨 표시 (sourceProperty 이름)
- 우클릭 메뉴: 편집, 삭제

### 4. 툴바

**툴바 기능:**
- **Add Entity**: 새 Entity 노드 추가
- **Add Relationship**: 관계 연결 모드 진입
- **Undo/Redo**: 실행 취소/재실행
- **Zoom In/Out**: 확대/축소
- **Fit View**: 전체 다이어그램 화면에 맞춤
- **Export**: 코드 내보내기 패널 열기

**디자인:**
- 상단 고정 툴바
- shadcn/ui Button 컴포넌트 사용
- 아이콘: lucide-react
- Dark mode 지원

### 5. 프로퍼티 편집 패널

**패널 위치:** 우측 사이드바 (슬라이드 인/아웃)

**편집 가능 항목:**
- **Entity 편집:**
  - Entity 이름
  - 커스텀 테이블명
  - 프로퍼티 목록 (추가/편집/삭제)

- **프로퍼티 편집:**
  - 이름
  - 타입 (드롭다운: string, number, boolean, Date, 커스텀)
  - Primary Key 체크박스
  - Unique 체크박스
  - Nullable 체크박스
  - Default Value 입력

- **Relationship 편집:**
  - 관계 타입 (드롭다운)
  - Source Property 이름
  - Target Property 이름 (양방향)
  - Nullable 체크박스
  - Cascade 체크박스
  - Orphan Removal 체크박스

**디자인:**
- shadcn/ui Form 컴포넌트
- Label + Input/Select/Checkbox 조합
- "Save" / "Cancel" 버튼

### 6. TypeScript 코드 생성

**생성 로직:**
- 현재 캔버스의 Entity 노드들을 순회
- 각 Entity를 MikroORM 데코레이터가 포함된 TypeScript 클래스로 변환
- Relationship을 `@OneToOne`, `@ManyToOne` 등 데코레이터로 변환
- 생성된 코드는 MikroORM 공식 문법 준수

**예시 출력:**
```typescript
import { Entity, PrimaryKey, Property, OneToMany, Collection } from "@mikro-orm/core"
import { Post } from "./Post"

@Entity()
export class User {
  @PrimaryKey()
  id!: number

  @Property({ unique: true })
  email!: string

  @Property()
  name!: string

  @OneToMany(() => Post, post => post.author)
  posts = new Collection<Post>(this)
}
```

**Export UI:**
- 코드 미리보기 패널 (모달 또는 사이드바)
- Syntax 하이라이팅 (react-syntax-highlighter)
- "Copy to Clipboard" 버튼
- "Download as .ts" 버튼
- 파일명 입력 (예: "User.ts", "Post.ts" 등)

---

## 작업 단위 (Task Breakdown)

### Task 1.1: 프로젝트 기초 설정

**담당**: Setup & Configuration
**예상 난이도**: Low
**의존성**: 없음

**세부 작업:**
1. ReactFlow 패키지 설치
   ```bash
   bun add @xyflow/react
   bun add -d @types/react
   ```

2. ReactFlow 스타일 import 확인
   - `app/globals.css` 또는 필요한 곳에 `@xyflow/react/dist/style.css` import

3. `types/` 디렉토리 생성 및 기본 타입 정의
   - `types/editor.ts`
   - `types/entity.ts`
   - `types/relationship.ts`

**완료 조건:**
- [ ] ReactFlow 패키지 정상 설치 및 import 가능
- [ ] `types/` 디렉토리 생성 및 기본 타입 파일 3개 생성
- [ ] `bun dev` 실행 시 오류 없음

**커밋 메시지 템플릿:**
```
chore(setup): ReactFlow 패키지 설치 및 기본 타입 정의

- @xyflow/react 패키지 설치
- types/ 디렉토리 생성 및 editor.ts, entity.ts, relationship.ts 파일 추가
- ReactFlow 스타일 import 설정

관련 Task: Phase 1 - Task 1.1
```

---

### Task 1.2: 기본 타입 정의

**담당**: TypeScript Types
**예상 난이도**: Medium
**의존성**: Task 1.1 완료 후

**세부 작업:**

1. **`types/entity.ts` 작성**
   ```typescript
   export interface EntityProperty {
     id: string
     name: string
     type: string // "string" | "number" | "boolean" | "Date" | 커스텀
     isPrimaryKey: boolean
     isUnique: boolean
     isNullable: boolean
     defaultValue?: string
   }

   export interface EntityData {
     name: string
     tableName?: string
     properties: EntityProperty[]
   }

   export interface EntityNode {
     id: string
     type: "entity"
     position: { x: number; y: number }
     data: EntityData
   }
   ```

2. **`types/relationship.ts` 작성**
   ```typescript
   export enum RelationType {
     OneToOne = "OneToOne",
     OneToMany = "OneToMany",
     ManyToOne = "ManyToOne",
     ManyToMany = "ManyToMany",
   }

   export interface RelationshipData {
     relationType: RelationType
     sourceProperty: string
     targetProperty?: string
     isNullable: boolean
     cascade: boolean
     orphanRemoval: boolean
   }

   export interface RelationshipEdge {
     id: string
     type: "relationship"
     source: string
     target: string
     data: RelationshipData
   }
   ```

3. **`types/editor.ts` 작성**
   ```typescript
   import type { EntityNode } from "./entity"
   import type { RelationshipEdge } from "./relationship"

   export interface EditorState {
     nodes: EntityNode[]
     edges: RelationshipEdge[]
   }
   ```

**완료 조건:**
- [ ] 모든 타입 파일 작성 완료
- [ ] TypeScript 컴파일 오류 없음
- [ ] JSDoc 주석으로 각 타입 설명 추가

**커밋 메시지 템플릿:**
```
feat(types): Entity 및 Relationship 타입 정의

- EntityProperty, EntityData, EntityNode 타입 정의
- RelationType enum 및 RelationshipData, RelationshipEdge 타입 정의
- EditorState 타입 정의

관련 Task: Phase 1 - Task 1.2
```

---

### Task 1.3: ReactFlow 캔버스 컴포넌트 구현

**담당**: Editor Canvas
**예상 난이도**: Medium
**의존성**: Task 1.2 완료 후

**세부 작업:**

1. `app/(routes)/editor/page.tsx` 생성
   - `/editor` 라우트 생성
   - ReactFlow 기본 설정

2. `components/editor/canvas/editor-canvas.tsx` 생성
   - ReactFlow 컴포넌트 래핑
   - 기본 노드/엣지 상태 관리
   - 미니맵, 컨트롤 패널 추가

3. `hooks/use-editor.ts` 생성
   - 에디터 전역 상태 관리 훅
   - `useNodesState`, `useEdgesState` 활용

**코드 예시:**
```typescript
"use client"

import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react"
import { useEditor } from "@/hooks/use-editor"
import "@xyflow/react/dist/style.css"

export function EditorCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useEditor()

  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
```

**완료 조건:**
- [ ] `/editor` 라우트 접근 시 ReactFlow 캔버스 표시
- [ ] 드래그, 줌, 패닝 기능 동작
- [ ] 미니맵 및 컨트롤 패널 표시
- [ ] Dark mode 지원 (next-themes 연동)

**커밋 메시지 템플릿:**
```
feat(editor): ReactFlow 기본 캔버스 구현

- /editor 라우트 및 페이지 생성
- EditorCanvas 컴포넌트 구현 (ReactFlow 래핑)
- use-editor 훅으로 노드/엣지 상태 관리
- 미니맵, 컨트롤 패널, 배경 그리드 추가
- Dark mode 지원

관련 Task: Phase 1 - Task 1.3
참고: https://reactflow.dev/learn
```

---

### Task 1.4: Entity 노드 커스텀 컴포넌트 구현

**담당**: Custom Node
**예상 난이도**: High
**의존성**: Task 1.3 완료 후

**세부 작업:**

1. `components/editor/nodes/entity-node.tsx` 생성
   - Entity 정보 표시 (이름, 프로퍼티 목록)
   - shadcn/ui Card 컴포넌트 활용
   - Primary Key, Unique 아이콘 표시

2. ReactFlow에 커스텀 노드 타입 등록
   ```typescript
   const nodeTypes = {
     entity: EntityNode,
   }
   ```

3. 노드 핸들 (Handle) 추가
   - 상하좌우 4방향 핸들
   - Relationship 연결용

**코드 예시:**
```typescript
import { Handle, Position } from "@xyflow/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { EntityData } from "@/types/entity"
import { Key, Hash } from "lucide-react"

interface EntityNodeProps {
  data: EntityData
}

export function EntityNode({ data }: EntityNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />
      <Card className="min-w-[200px]">
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {data.properties.map((prop) => (
              <div key={prop.id} className="flex items-center gap-2 text-sm">
                {prop.isPrimaryKey && <Key className="h-3 w-3" />}
                {prop.isUnique && <Hash className="h-3 w-3" />}
                <span>{prop.name}</span>
                <span className="text-muted-foreground">: {prop.type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </>
  )
}
```

**완료 조건:**
- [ ] EntityNode 컴포넌트 구현
- [ ] ReactFlow에 nodeTypes 등록
- [ ] 노드 추가 시 정상 렌더링
- [ ] 프로퍼티 목록 표시 (PK, Unique 아이콘 포함)
- [ ] 4방향 핸들 동작 확인

**커밋 메시지 템플릿:**
```
feat(editor): EntityNode 커스텀 컴포넌트 구현

- EntityNode 컴포넌트 생성 (shadcn/ui Card 활용)
- Entity 이름 및 프로퍼티 목록 표시
- Primary Key (Key 아이콘), Unique (Hash 아이콘) 표시
- 상하좌우 4방향 핸들 추가 (관계 연결용)
- ReactFlow nodeTypes에 등록

관련 Task: Phase 1 - Task 1.4
참고: https://reactflow.dev/examples/nodes/custom-node
```

---

### Task 1.5: Relationship 엣지 커스텀 컴포넌트 구현

**담당**: Custom Edge
**예상 난이도**: High
**의존성**: Task 1.4 완료 후

**세부 작업:**

1. `components/editor/edges/relationship-edge.tsx` 생성
   - 관계 타입에 따른 엣지 스타일
   - EdgeLabelRenderer로 라벨 표시

2. ReactFlow에 커스텀 엣지 타입 등록
   ```typescript
   const edgeTypes = {
     relationship: RelationshipEdge,
   }
   ```

3. 관계 타입별 마커 정의
   - OneToOne: 양방향 화살표
   - OneToMany: 시작점 일반, 끝점 까마귀발
   - ManyToOne: OneToMany 역방향
   - ManyToMany: 양방향 까마귀발

**코드 예시:**
```typescript
import { getBezierPath, EdgeLabelRenderer } from "@xyflow/react"
import type { RelationshipData } from "@/types/relationship"

export function RelationshipEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={2}
        stroke="#555"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="nodrag nopan text-xs bg-background border rounded px-2 py-1"
        >
          {data.sourceProperty}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
```

**완료 조건:**
- [ ] RelationshipEdge 컴포넌트 구현
- [ ] ReactFlow edgeTypes 등록
- [ ] 엣지 연결 시 정상 렌더링
- [ ] 엣지 라벨 (sourceProperty) 표시
- [ ] 관계 타입별 스타일 적용

**커밋 메시지 템플릿:**
```
feat(editor): RelationshipEdge 커스텀 컴포넌트 구현

- RelationshipEdge 컴포넌트 생성
- EdgeLabelRenderer로 sourceProperty 라벨 표시
- 관계 타입별 엣지 스타일 정의 (OneToOne, OneToMany 등)
- ReactFlow edgeTypes에 등록

관련 Task: Phase 1 - Task 1.5
참고: https://reactflow.dev/examples/edges/custom-edge
```

---

### Task 1.6: 툴바 UI 구현

**담당**: Toolbar UI
**예상 난이도**: Medium
**의존성**: Task 1.5 완료 후

**세부 작업:**

1. `components/editor/toolbar/editor-toolbar.tsx` 생성
   - Add Entity 버튼
   - Add Relationship 버튼
   - Undo/Redo 버튼
   - Zoom In/Out 버튼
   - Fit View 버튼
   - Export 버튼

2. 툴바 기능 구현
   - Add Entity: 새 Entity 노드 추가
   - 각 버튼 클릭 시 해당 액션 실행

3. 디자인
   - shadcn/ui Button 사용
   - lucide-react 아이콘
   - 상단 고정 (fixed top)

**코드 예시:**
```typescript
import { Button } from "@/components/ui/button"
import { Plus, Link, Undo, Redo, ZoomIn, ZoomOut, Maximize, Download } from "lucide-react"

export function EditorToolbar() {
  const handleAddEntity = () => {
    // Entity 추가 로직
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 p-2">
        <Button variant="outline" size="sm" onClick={handleAddEntity}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
        <Button variant="outline" size="sm">
          <Link className="h-4 w-4 mr-2" />
          Add Relationship
        </Button>
        <div className="border-l h-6 mx-2" />
        <Button variant="ghost" size="icon">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Redo className="h-4 w-4" />
        </Button>
        <div className="border-l h-6 mx-2" />
        <Button variant="ghost" size="icon">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Maximize className="h-4 w-4" />
        </Button>
        <div className="ml-auto" />
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}
```

**완료 조건:**
- [ ] EditorToolbar 컴포넌트 구현
- [ ] 모든 버튼 UI 표시
- [ ] Add Entity 버튼 기능 동작
- [ ] 상단 고정 레이아웃
- [ ] Dark mode 지원

**커밋 메시지 템플릿:**
```
feat(editor): 에디터 툴바 UI 구현

- EditorToolbar 컴포넌트 생성
- Add Entity, Add Relationship, Undo/Redo, Zoom, Export 버튼 추가
- shadcn/ui Button 및 lucide-react 아이콘 사용
- 상단 고정 레이아웃 (backdrop-blur 효과)
- Add Entity 버튼 클릭 시 새 Entity 노드 추가 기능 구현

관련 Task: Phase 1 - Task 1.6
```

---

### Task 1.7: Entity 생성/편집 기능 구현

**담당**: Entity Management
**예상 난이도**: High
**의존성**: Task 1.6 완료 후

**세부 작업:**

1. `components/editor/panels/entity-edit-panel.tsx` 생성
   - 우측 슬라이드 패널
   - Entity 이름 편집
   - 프로퍼티 목록 편집
   - "Add Property" 버튼

2. `hooks/use-entity-editor.ts` 생성
   - Entity 추가/편집/삭제 로직
   - Property 추가/편집/삭제 로직

3. Entity 노드 클릭 시 패널 열기

**코드 예시:**
```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function EntityEditPanel({ entity, isOpen, onClose, onSave }) {
  const [name, setName] = useState(entity.name)
  const [properties, setProperties] = useState(entity.properties)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Entity</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="entity-name">Entity Name</Label>
            <Input
              id="entity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Properties 편집 UI */}
          <Button onClick={() => onSave({ name, properties })}>
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

**완료 조건:**
- [ ] EntityEditPanel 컴포넌트 구현
- [ ] Entity 이름 편집 가능
- [ ] Property 추가/편집/삭제 가능
- [ ] 노드 클릭 시 패널 열림
- [ ] 변경사항 저장 시 노드 업데이트

**커밋 메시지 템플릿:**
```
feat(editor): Entity 생성/편집 패널 구현

- EntityEditPanel 컴포넌트 생성 (shadcn/ui Sheet 사용)
- Entity 이름 편집 기능
- Property 추가/편집/삭제 UI 및 로직
- use-entity-editor 훅으로 상태 관리
- 노드 클릭 시 패널 슬라이드 인

관련 Task: Phase 1 - Task 1.7
```

---

### Task 1.8: Property 편집 상세 기능 구현

**담당**: Property Editor
**예상 난이도**: Medium
**의존성**: Task 1.7 완료 후

**세부 작업:**

1. `components/editor/panels/property-form.tsx` 생성
   - Property 이름 입력
   - 타입 선택 (드롭다운)
   - Primary Key 체크박스
   - Unique 체크박스
   - Nullable 체크박스
   - Default Value 입력

2. 타입 옵션 정의
   - string, number, boolean, Date
   - 커스텀 타입 입력 가능

**코드 예시:**
```typescript
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function PropertyForm({ property, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="prop-name">Name</Label>
        <Input
          id="prop-name"
          value={property.name}
          onChange={(e) => onChange({ ...property, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="prop-type">Type</Label>
        <Select value={property.type} onValueChange={(value) => onChange({ ...property, type: value })}>
          <SelectTrigger id="prop-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">string</SelectItem>
            <SelectItem value="number">number</SelectItem>
            <SelectItem value="boolean">boolean</SelectItem>
            <SelectItem value="Date">Date</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="prop-pk"
          checked={property.isPrimaryKey}
          onCheckedChange={(checked) => onChange({ ...property, isPrimaryKey: checked })}
        />
        <Label htmlFor="prop-pk">Primary Key</Label>
      </div>
      {/* Unique, Nullable, Default Value */}
    </div>
  )
}
```

**완료 조건:**
- [ ] PropertyForm 컴포넌트 구현
- [ ] 모든 필드 편집 가능
- [ ] 타입 드롭다운 동작
- [ ] 체크박스 상태 관리
- [ ] 변경사항 실시간 반영

**커밋 메시지 템플릿:**
```
feat(editor): Property 편집 폼 구현

- PropertyForm 컴포넌트 생성
- 이름, 타입, Primary Key, Unique, Nullable, Default Value 편집 기능
- shadcn/ui Select, Input, Checkbox 컴포넌트 사용
- 타입 드롭다운 (string, number, boolean, Date)

관련 Task: Phase 1 - Task 1.8
```

---

### Task 1.9: Relationship 생성/편집 기능 구현

**담당**: Relationship Management
**예상 난이도**: High
**의존성**: Task 1.8 완료 후

**세부 작업:**

1. `components/editor/panels/relationship-edit-panel.tsx` 생성
   - 관계 타입 선택
   - Source/Target Property 이름 입력
   - Nullable, Cascade, Orphan Removal 옵션

2. Relationship 연결 모드 구현
   - 툴바 "Add Relationship" 버튼 클릭 시 모드 진입
   - 두 노드 순차 클릭으로 연결
   - 엣지 생성 및 데이터 설정

3. 엣지 클릭 시 편집 패널 열기

**코드 예시:**
```typescript
export function RelationshipEditPanel({ relationship, isOpen, onClose, onSave }) {
  const [relationType, setRelationType] = useState(relationship.data.relationType)
  const [sourceProperty, setSourceProperty] = useState(relationship.data.sourceProperty)
  // ...

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Relationship</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="rel-type">Relationship Type</Label>
            <Select value={relationType} onValueChange={setRelationType}>
              <SelectTrigger id="rel-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OneToOne">One to One</SelectItem>
                <SelectItem value="OneToMany">One to Many</SelectItem>
                <SelectItem value="ManyToOne">Many to One</SelectItem>
                <SelectItem value="ManyToMany">Many to Many</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Source Property, Target Property, 옵션 */}
          <Button onClick={() => onSave({ relationType, sourceProperty, ... })}>
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

**완료 조건:**
- [ ] RelationshipEditPanel 컴포넌트 구현
- [ ] 관계 타입 선택 드롭다운
- [ ] Source/Target Property 입력
- [ ] Nullable, Cascade, Orphan Removal 체크박스
- [ ] 엣지 클릭 시 패널 열림
- [ ] 변경사항 저장 시 엣지 업데이트

**커밋 메시지 템플릿:**
```
feat(editor): Relationship 생성/편집 기능 구현

- RelationshipEditPanel 컴포넌트 생성
- 관계 타입 선택 드롭다운 (OneToOne, OneToMany 등)
- Source Property, Target Property 입력
- Nullable, Cascade, Orphan Removal 옵션
- 엣지 클릭 시 편집 패널 열림

관련 Task: Phase 1 - Task 1.9
```

---

### Task 1.10: TypeScript 코드 생성 로직 구현

**담당**: Code Generator
**예상 난이도**: High
**의존성**: Task 1.9 완료 후

**세부 작업:**

1. `lib/mikro-orm/generator.ts` 생성
   - Entity 노드 → TypeScript 클래스 변환
   - Property → `@Property` 데코레이터
   - Relationship → `@OneToMany`, `@ManyToOne` 등 데코레이터

2. Import 문 생성
   - MikroORM 데코레이터 import
   - 다른 Entity import

3. 코드 포맷팅
   - Prettier 또는 수동 들여쓰기

**코드 예시:**
```typescript
import type { EntityNode } from "@/types/entity"
import type { RelationshipEdge } from "@/types/relationship"

export function generateEntityCode(entity: EntityNode, edges: RelationshipEdge[]): string {
  const imports = generateImports(entity, edges)
  const decorator = `@Entity()`
  const className = `export class ${entity.data.name}`

  const properties = entity.data.properties.map(prop => {
    const decorators: string[] = []
    if (prop.isPrimaryKey) {
      decorators.push(`@PrimaryKey()`)
    }
    const options: string[] = []
    if (prop.isUnique) options.push(`unique: true`)
    if (!prop.isNullable) options.push(`nullable: false`)
    if (prop.defaultValue) options.push(`default: ${prop.defaultValue}`)

    const propDecorator = decorators.length > 0
      ? decorators.join('\n  ')
      : `@Property(${options.length > 0 ? `{ ${options.join(', ')} }` : ''})`

    return `  ${propDecorator}\n  ${prop.name}!: ${prop.type}`
  }).join('\n\n')

  const relationships = edges
    .filter(edge => edge.source === entity.id || edge.target === entity.id)
    .map(edge => generateRelationshipDecorator(edge, entity))
    .join('\n\n')

  return `${imports}\n\n${decorator}\n${className} {\n${properties}\n\n${relationships}\n}`
}

function generateImports(entity: EntityNode, edges: RelationshipEdge[]): string {
  // Import 문 생성 로직
  return `import { Entity, PrimaryKey, Property, OneToMany, Collection } from "@mikro-orm/core"`
}

function generateRelationshipDecorator(edge: RelationshipEdge, entity: EntityNode): string {
  // Relationship 데코레이터 생성 로직
  return `  @OneToMany(() => Post, post => post.author)\n  posts = new Collection<Post>(this)`
}
```

**완료 조건:**
- [ ] generateEntityCode 함수 구현
- [ ] Import 문 생성 로직
- [ ] Property 데코레이터 생성
- [ ] Relationship 데코레이터 생성 (4가지 타입)
- [ ] 생성된 코드가 MikroORM 문법에 맞음
- [ ] 테스트 케이스 작성 및 검증

**커밋 메시지 템플릿:**
```
feat(lib): TypeScript 코드 생성 로직 구현

- lib/mikro-orm/generator.ts 생성
- generateEntityCode 함수로 Entity → TypeScript 클래스 변환
- Property → @Property, @PrimaryKey 데코레이터 생성
- Relationship → @OneToMany, @ManyToOne 등 데코레이터 생성
- Import 문 자동 생성
- 코드 포맷팅 및 들여쓰기 처리

관련 Task: Phase 1 - Task 1.10
참고: https://mikro-orm.io/docs/decorators
```

---

### Task 1.11: Export UI 및 다운로드 기능 구현

**담당**: Export UI
**예상 난이도**: Medium
**의존성**: Task 1.10 완료 후

**세부 작업:**

1. `components/export/export-modal.tsx` 생성
   - 모달 또는 사이드 패널
   - 생성된 코드 미리보기
   - Syntax 하이라이팅

2. "Download as .ts" 버튼
   - Blob 생성 및 다운로드

3. "Copy to Clipboard" 버튼
   - navigator.clipboard API 사용

**코드 예시:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"

export function ExportModal({ isOpen, onClose, code, fileName }) {
  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/typescript" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}.ts`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    // Show toast: "Copied to clipboard!"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export TypeScript Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
            {code}
          </SyntaxHighlighter>
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download as .ts
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**완료 조건:**
- [ ] ExportModal 컴포넌트 구현
- [ ] Syntax 하이라이팅 (react-syntax-highlighter)
- [ ] Copy to Clipboard 기능 동작
- [ ] Download as .ts 기능 동작
- [ ] 툴바 Export 버튼 클릭 시 모달 열림

**커밋 메시지 템플릿:**
```
feat(export): Export UI 및 다운로드 기능 구현

- ExportModal 컴포넌트 생성 (shadcn/ui Dialog)
- react-syntax-highlighter로 TypeScript 코드 하이라이팅
- "Copy to Clipboard" 버튼 (navigator.clipboard API)
- "Download as .ts" 버튼 (Blob 생성 및 다운로드)
- 툴바 Export 버튼 연동

관련 Task: Phase 1 - Task 1.11
```

---

## 제외 사항

Phase 1에서 구현하지 않는 것들:
- ❌ JSON Schema export (Phase 2)
- ❌ ERD 이미지 export (Phase 2)
- ❌ SQL DDL export (Phase 3)
- ❌ DDL/JSON import (Phase 3)
- ❌ Embeddable, Index 등 고급 MikroORM 기능 (Phase 2)
- ❌ 협업 기능 (추후 논의)
- ❌ Undo/Redo 실제 구현 (UI만 Phase 1, 기능은 Phase 4)
- ❌ 자동 레이아웃 (dagre 등) (Phase 4)

---

## 성공 메트릭

Phase 1 완료 기준:
1. ✅ `/editor` 라우트에서 ReactFlow 캔버스 접근 가능
2. ✅ Entity 노드 추가 및 드래그 이동 가능
3. ✅ Entity 이름 및 프로퍼티 편집 가능
4. ✅ 4가지 Relationship 타입 연결 가능
5. ✅ Export 버튼 클릭 시 TypeScript 코드 생성 및 다운로드 가능
6. ✅ 생성된 코드가 MikroORM 공식 문법에 맞고 컴파일 가능 (수동 검증)

---

## 다음 단계

Phase 1 완료 후:
- Phase 2 시작: JSON Schema, ERD 이미지 export, 고급 MikroORM 기능 추가
- 진행 상황 문서 업데이트 (`ai-context/progress/`)
- 사용자 피드백 수집 및 반영
