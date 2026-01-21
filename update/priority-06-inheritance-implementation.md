# Priority 06: Inheritance/Implementation 관계 추가

## 개요
UML의 상속(Inheritance)과 구현(Implementation) 관계를 추가합니다. MikroORM 코드 생성 시 TypeScript의 `extends`와 `implements` 키워드로 변환됩니다.

**난이도:** 중간
**병렬 처리:** 부분 가능 (타입 정의 후 UI/코드생성 병렬)
**기존 코드 영향:** 중간 (RelationType 확장, 엣지 시각화 추가)

---

## 영향받는 컴포넌트

| 컴포넌트 | 변경 사항 |
|---------|----------|
| ✅ 사이드 메뉴 | 영향 없음 (관계는 엣지로 생성) |
| ✅ 캔버스 | **빈 삼각형 마커가 있는 엣지 시각화** |
| ✅ 프로퍼티 설정 사이드바 | **관계 타입에 Inheritance/Implementation 추가** |
| ✅ Export Code | **extends/implements 키워드 코드 생성** |

---

## 개념 정리

| 관계 타입 | 의미 | 시각화 | TypeScript 코드 |
|---------|------|--------|-----------------|
| **Inheritance** | 클래스 상속 (is-a) | 실선 + 빈 삼각형 | `class Dog extends Animal` |
| **Implementation** | 인터페이스 구현 | 점선 + 빈 삼각형 | `class User implements IUser` |

**방향:**
- 자식 → 부모 (화살표는 부모를 가리킴)
- 예: `Dog --▷ Animal`

---

## 구체적인 작업 항목

### 1. 타입 정의 (`types/relationship.ts`)

**작업:**
```typescript
// RelationType enum 확장
export enum RelationType {
  // 기존 타입들...
  Composition = "Composition",
  Aggregation = "Aggregation",

  // 상속 관계 추가
  Inheritance = "Inheritance",      // 실선 + 빈 삼각형
  Implementation = "Implementation", // 점선 + 빈 삼각형
}
```

**파일:** `types/relationship.ts`
**라인:** RelationType enum (약 12-25)

---

### 2. 엣지 마커 생성 (`components/editor/edges/shared/edge-markers.tsx`)

**작업:**
- 빈 삼각형 마커 SVG 추가

**구현:**
```tsx
// components/editor/edges/shared/edge-markers.tsx

// 상속/구현 마커 (빈 삼각형)
export function InheritanceMarker() {
  return (
    <marker
      id="inheritance"
      viewBox="0 0 20 20"
      refX="20"
      refY="10"
      markerWidth="10"
      markerHeight="10"
      orient="auto"
    >
      <path
        d="M 0 10 L 20 5 L 20 15 Z"
        fill="hsl(var(--background))"
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
      />
    </marker>
  )
}
```

**파일:** `components/editor/edges/shared/edge-markers.tsx`
**참고:** Inheritance와 Implementation은 동일한 마커 사용 (빈 삼각형)

---

### 3. 엣지 시각화 (`components/editor/edges/relationship-edge.tsx`)

**작업:**
- Inheritance: 실선 + 빈 삼각형
- Implementation: 점선 + 빈 삼각형

**구현:**
```tsx
// components/editor/edges/relationship-edge.tsx

const getEdgeStyle = (type: RelationType) => {
  const baseStyle = {
    stroke: "hsl(var(--foreground))",
    strokeWidth: 2,
  }

  // Implementation은 점선
  if (type === RelationType.Implementation) {
    return {
      ...baseStyle,
      strokeDasharray: "5,5",
    }
  }

  return baseStyle
}

const getMarkerEnd = (type: RelationType) => {
  if (
    type === RelationType.Inheritance ||
    type === RelationType.Implementation
  ) {
    return "url(#inheritance)"
  }

  return "url(#arrow)" // 기본 화살표
}

// 렌더링
<BaseEdge
  path={edgePath}
  markerEnd={getMarkerEnd(data.type)}
  style={getEdgeStyle(data.type)}
/>
```

**파일:** `components/editor/edges/relationship-edge.tsx`
**라인:** BaseEdge 렌더링 부분

---

### 4. 관계 선택 UI (`components/editor/panels/relationship-edit-panel.tsx`)

**작업:**
- RelationType 선택에 Inheritance/Implementation 추가

**구현:**
```tsx
// components/editor/panels/relationship-edit-panel.tsx

<Select value={editedData.type} onValueChange={...}>
  <SelectContent>
    {/* 기존 옵션들 */}

    {/* 신규 옵션 */}
    <SelectItem value={RelationType.Inheritance}>
      Inheritance (▷ 상속)
    </SelectItem>
    <SelectItem value={RelationType.Implementation}>
      Implementation (⋯▷ 구현)
    </SelectItem>
  </SelectContent>
</Select>
```

**파일:** `components/editor/panels/relationship-edit-panel.tsx`
**라인:** RelationType 선택 드롭다운

---

### 5. 코드 생성 로직 (`lib/mikro-orm/generators/entity.ts`)

**작업:**
- Inheritance/Implementation 관계를 `extends`/`implements`로 변환

**구현:**
```typescript
// lib/mikro-orm/generators/entity.ts

export function generateEntityClass(
  node: EntityNode | RootNode,
  edges: RelationshipEdge[]
): string {
  const { name, properties } = node.data

  // 이 노드가 자식인 Inheritance/Implementation 관계 찾기
  const inheritanceEdge = edges.find(
    (edge) =>
      edge.source === node.id &&
      edge.data.type === RelationType.Inheritance
  )

  const implementationEdges = edges.filter(
    (edge) =>
      edge.source === node.id &&
      edge.data.type === RelationType.Implementation
  )

  // extends/implements 문자열 생성
  let extendsClause = ""
  let implementsClause = ""

  if (inheritanceEdge) {
    const parentNode = findNodeById(inheritanceEdge.target)
    extendsClause = ` extends ${parentNode.data.name}`
  }

  if (implementationEdges.length > 0) {
    const interfaceNames = implementationEdges
      .map((edge) => findNodeById(edge.target).data.name)
      .join(", ")
    implementsClause = ` implements ${interfaceNames}`
  }

  // 클래스 생성
  return `
@Entity()
export class ${name}${extendsClause}${implementsClause} {
  ${properties.map(generateProperty).join("\n\n  ")}
}
  `.trim()
}
```

**파일:** `lib/mikro-orm/generators/entity.ts`
**함수:** `generateEntityClass`

**생성 예시:**
```typescript
// Inheritance
@Entity()
export class Dog extends Animal {
  @Property()
  breed!: string
}

// Implementation
@Entity()
export class User implements IAuditable {
  @Property()
  createdAt!: Date

  @Property()
  updatedAt!: Date
}

// 둘 다
@Entity()
export class Admin extends User implements IAdminPermissions {
  @Property()
  role!: string
}
```

---

### 6. 관계 검증 로직 추가

**작업:**
- Inheritance/Implementation은 1:1 관계만 가능 (Many 불가)
- Inheritance는 하나의 부모만 가능 (단일 상속)

**구현:**
```typescript
// hooks/use-edges.ts 또는 relationship-edit-panel.tsx

const validateInheritance = (
  sourceNodeId: string,
  type: RelationType,
  edges: RelationshipEdge[]
) => {
  if (type === RelationType.Inheritance) {
    // 이미 상속 관계가 있는지 확인
    const existingInheritance = edges.find(
      (edge) =>
        edge.source === sourceNodeId &&
        edge.data.type === RelationType.Inheritance
    )

    if (existingInheritance) {
      throw new Error("단일 상속만 지원합니다. 기존 상속 관계를 먼저 삭제하세요.")
    }
  }
}
```

**파일:** `hooks/use-edges.ts` 또는 `relationship-edit-panel.tsx`

---

## 병렬 처리 전략

**순차적 작업:**
1. 타입 정의 (`types/relationship.ts`) - **먼저 완료 필요**

**병렬 처리 가능:**
2. 엣지 마커 생성 (`edge-markers.tsx`)
3. 엣지 시각화 (`relationship-edge.tsx`)
4. UI 컴포넌트 (`relationship-edit-panel.tsx`)
5. 코드 생성 로직 (`entity.ts`)

**서브 에이전트 할당 제안:**
- Agent 1: 타입 정의 → 엣지 마커 + 시각화
- Agent 2: UI 컴포넌트 → 코드 생성 로직

---

## 기존 코드에 영향을 주지 않는 방법

1. **기존 RelationType은 그대로 유지**
   - Inheritance/Implementation만 추가

2. **코드 생성 시 조건부 처리**
   - `extends`/`implements` 절은 해당 관계가 있을 때만 추가

3. **검증 로직은 선택사항**
   - 단일 상속 검증은 추가 기능 (기존 동작 방해 안 함)

---

## 완료 조건

- [ ] `types/relationship.ts`에 Inheritance/Implementation 추가
- [ ] `edge-markers.tsx`에 빈 삼각형 마커 추가
- [ ] `relationship-edge.tsx`에 점선/실선 + 마커 적용
- [ ] `relationship-edit-panel.tsx`에 선택 옵션 추가
- [ ] `entity.ts`에 extends/implements 코드 생성 로직 추가
- [ ] 단일 상속 검증 로직 추가 (선택사항)
- [ ] 코드 생성 테스트 (extends/implements 확인)
- [ ] `bun run lint` 통과
- [ ] `bun run build` 성공

---

## 예상 소요 시간

- 타입 정의: 5분
- 엣지 마커: 15분
- 엣지 시각화: 20분
- UI 컴포넌트: 10분
- 코드 생성 로직: 30분
- 검증 로직: 20분
- 테스트: 20분
- **총 예상 시간: 2시간**

---

## 시각적 변경 사항

**Inheritance (실선 + 빈 삼각형):**
```
[Dog] ────▷ [Animal]
```

**Implementation (점선 + 빈 삼각형):**
```
[User] ⋯⋯⋯▷ [IAuditable]
```

**복합 관계:**
```
[Admin] ────▷ [User]
[Admin] ⋯⋯⋯▷ [IAdminPermissions]
```
