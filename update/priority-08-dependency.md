# Priority 08: Dependency 관계 추가

## 개요
UML의 Dependency(의존) 관계를 추가합니다. 한 클래스가 다른 클래스를 일시적으로 사용하는 약한 관계를 표현하며, 코드 생성 시 import 문으로 표현됩니다.

**난이도:** 낮음
**병렬 처리:** 가능 (타입 정의 후 UI/코드생성 병렬)
**기존 코드 영향:** 최소 (RelationType 확장, 엣지 시각화 추가)

---

## 영향받는 컴포넌트

| 컴포넌트 | 변경 사항 |
|---------|----------|
| ✅ 사이드 메뉴 | 영향 없음 |
| ✅ 캔버스 | **점선 화살표 엣지 시각화** |
| ✅ 프로퍼티 설정 사이드바 | **관계 타입에 Dependency 추가** |
| ✅ Export Code | **import 문 생성 (선택사항)** |

---

## 개념 정리

| 관계 타입 | 의미 | 시각화 | TypeScript 코드 |
|---------|------|--------|-----------------|
| **Dependency** | 일시적 사용 관계 | 점선 화살표 | `import { ... } from "..."` |

**예시:**
- `OrderService`가 `PaymentGateway`를 메서드 파라미터로 사용
- `UserController`가 `Logger`를 정적 메서드로 호출

**방향:**
- 사용자 → 피사용자 (화살표는 사용되는 쪽을 가리킴)
- 예: `OrderService ⋯⋯→ PaymentGateway`

---

## 구체적인 작업 항목

### 1. 타입 정의 (`types/relationship.ts`)

**작업:**
```typescript
// RelationType enum 확장
export enum RelationType {
  // 기존 타입들...
  Inheritance = "Inheritance",
  Implementation = "Implementation",

  // 의존 관계 추가
  Dependency = "Dependency", // 점선 화살표
}
```

**파일:** `types/relationship.ts`
**라인:** RelationType enum

---

### 2. 엣지 시각화 (`components/editor/edges/relationship-edge.tsx`)

**작업:**
- Dependency 관계에 점선 화살표 적용

**구현:**
```tsx
// components/editor/edges/relationship-edge.tsx

const getEdgeStyle = (type: RelationType) => {
  const baseStyle = {
    stroke: "hsl(var(--foreground))",
    strokeWidth: 2,
  }

  // Dependency와 Implementation은 점선
  if (
    type === RelationType.Dependency ||
    type === RelationType.Implementation
  ) {
    return {
      ...baseStyle,
      strokeDasharray: "5,5",
    }
  }

  return baseStyle
}

// 렌더링
<BaseEdge
  path={edgePath}
  markerEnd="url(#arrow)" // 일반 화살표
  style={getEdgeStyle(data.type)}
/>
```

**파일:** `components/editor/edges/relationship-edge.tsx`
**라인:** getEdgeStyle 함수 (Priority 06에서 이미 구현 완료)

**참고:** Implementation과 동일한 점선 스타일 사용

---

### 3. 관계 선택 UI (`components/editor/panels/relationship-edit-panel.tsx`)

**작업:**
- RelationType 선택에 Dependency 추가

**구현:**
```tsx
// components/editor/panels/relationship-edit-panel.tsx

<Select value={editedData.type} onValueChange={...}>
  <SelectContent>
    {/* 기존 옵션들 */}

    {/* 신규 옵션 */}
    <SelectItem value={RelationType.Dependency}>
      Dependency (⋯→ 의존)
    </SelectItem>
  </SelectContent>
</Select>
```

**파일:** `components/editor/panels/relationship-edit-panel.tsx`
**라인:** RelationType 선택 드롭다운

---

### 4. 코드 생성 로직 (선택사항)

**작업:**
- Dependency 관계를 import 문으로 생성 (선택사항)

**구현:**
```typescript
// lib/mikro-orm/generators/entity.ts

export function generateEntityImports(
  node: EntityNode,
  edges: RelationshipEdge[]
): string[] {
  const imports: string[] = []

  // Dependency 관계 찾기
  const dependencyEdges = edges.filter(
    (edge) =>
      edge.source === node.id &&
      edge.data.type === RelationType.Dependency
  )

  // import 문 생성
  dependencyEdges.forEach((edge) => {
    const targetNode = findNodeById(edge.target)
    imports.push(`import { ${targetNode.data.name} } from "./${targetNode.data.name}"`)
  })

  return imports
}
```

**파일:** `lib/mikro-orm/generators/entity.ts`
**함수:** `generateEntityImports` (신규)

**생성 예시:**
```typescript
import { PaymentGateway } from "./PaymentGateway"
import { Logger } from "./Logger"

@Entity()
export class OrderService {
  // ...
}
```

**참고:**
- Dependency는 주로 메서드 파라미터나 일시적 사용을 의미하므로, import만 생성하고 속성으로는 추가하지 않음
- 이 기능은 **선택사항**으로, 구현하지 않아도 Dependency 관계 시각화는 가능

---

## 병렬 처리 전략

**순차적 작업:**
1. 타입 정의 (`types/relationship.ts`) - **먼저 완료 필요**

**병렬 처리 가능:**
2. 엣지 시각화 (`relationship-edge.tsx`)
3. UI 컴포넌트 (`relationship-edit-panel.tsx`)
4. 코드 생성 로직 (`entity.ts`) - 선택사항

**서브 에이전트 할당 제안:**
- Agent 1: 타입 정의 → 엣지 시각화 → UI 컴포넌트
- (선택) Agent 2: 코드 생성 로직

---

## 기존 코드에 영향을 주지 않는 방법

1. **기존 RelationType은 그대로 유지**
   - Dependency만 추가

2. **엣지 스타일은 조건부 적용**
   - Implementation과 동일한 점선 로직 재사용

3. **코드 생성은 선택사항**
   - import 문 생성 없이도 시각화는 동작

---

## 완료 조건

- [ ] `types/relationship.ts`에 Dependency 추가
- [ ] `relationship-edge.tsx`에 점선 스타일 적용 (이미 Priority 06 완료)
- [ ] `relationship-edit-panel.tsx`에 선택 옵션 추가
- [ ] (선택) `entity.ts`에 import 문 생성 로직 추가
- [ ] Dependency 엣지 렌더링 테스트
- [ ] `bun run lint` 통과
- [ ] `bun run build` 성공

---

## 예상 소요 시간

- 타입 정의: 5분
- 엣지 시각화: 5분 (이미 구현됨)
- UI 컴포넌트: 5분
- (선택) 코드 생성: 20분
- 테스트: 10분
- **총 예상 시간: 25분 (선택사항 포함 시 45분)**

---

## 시각적 변경 사항

**Dependency (점선 화살표):**
```
[OrderService] ⋯⋯⋯→ [PaymentGateway]
[UserController] ⋯⋯⋯→ [Logger]
```

**구분:**
- **Dependency:** 점선 + 일반 화살표 (⋯⋯→)
- **Implementation:** 점선 + 빈 삼각형 (⋯⋯▷)
