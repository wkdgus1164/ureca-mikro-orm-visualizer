# Priority 03: Composition/Aggregation 관계 추가

## 개요
UML의 Composition(합성)과 Aggregation(집합) 관계를 추가합니다. MikroORM 코드 생성 시 `orphanRemoval` 옵션으로 구분됩니다.

**난이도:** 중간
**병렬 처리:** 부분 가능 (타입 정의 후 UI/코드생성 병렬)
**기존 코드 영향:** 중간 (RelationType enum 확장, 엣지 시각화 추가)

---

## 영향받는 컴포넌트

| 컴포넌트 | 변경 사항 |
|---------|----------|
| ✅ 사이드 메뉴 | **Composition/Aggregation 관계 추가 버튼** (선택사항) |
| ✅ 캔버스 | **다이아몬드 마커가 있는 엣지 시각화** |
| ✅ 프로퍼티 설정 사이드바 | **관계 타입 선택에 Composition/Aggregation 추가** |
| ✅ Export Code | **orphanRemoval 옵션 자동 설정** |

---

## 개념 정리

| 관계 타입 | 의미 | 예시 | MikroORM 코드 |
|---------|------|------|--------------|
| **Composition** | 강한 결합 (부모 삭제 시 자식도 삭제) | 자동차 ◆→ 엔진 | `orphanRemoval: true` |
| **Aggregation** | 약한 결합 (부모 삭제 시 자식은 유지) | 대학 ◇→ 교수 | `orphanRemoval: false` |

**시각적 차이:**
- Composition: **채워진 다이아몬드** (◆)
- Aggregation: **빈 다이아몬드** (◇)

---

## 구체적인 작업 항목

### 1. 타입 정의 (`types/relationship.ts`)

**작업:**
```typescript
// RelationType enum 확장
export enum RelationType {
  // 기존 MikroORM 관계
  OneToOne = "OneToOne",
  OneToMany = "OneToMany",
  ManyToOne = "ManyToOne",
  ManyToMany = "ManyToMany",

  // UML 관계 추가
  Composition = "Composition",   // ◆ (채워진 다이아몬드)
  Aggregation = "Aggregation",   // ◇ (빈 다이아몬드)
}
```

**파일:** `types/relationship.ts`
**라인:** 약 12-21

---

### 2. 엣지 마커 생성 (`components/editor/edges/shared/edge-markers.tsx`)

**작업:**
- 다이아몬드 마커 SVG 추가

**구현:**
```tsx
// components/editor/edges/shared/edge-markers.tsx

// Composition 마커 (채워진 다이아몬드)
export function CompositionMarker() {
  return (
    <marker
      id="composition"
      viewBox="0 0 20 20"
      refX="10"
      refY="10"
      markerWidth="8"
      markerHeight="8"
      orient="auto-start-reverse"
    >
      <path
        d="M 0 10 L 10 5 L 20 10 L 10 15 Z"
        fill="hsl(var(--foreground))"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
      />
    </marker>
  )
}

// Aggregation 마커 (빈 다이아몬드)
export function AggregationMarker() {
  return (
    <marker
      id="aggregation"
      viewBox="0 0 20 20"
      refX="10"
      refY="10"
      markerWidth="8"
      markerHeight="8"
      orient="auto-start-reverse"
    >
      <path
        d="M 0 10 L 10 5 L 20 10 L 10 15 Z"
        fill="hsl(var(--background))"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
      />
    </marker>
  )
}
```

**파일:** `components/editor/edges/shared/edge-markers.tsx`
**위치:** 기존 ArrowMarker 옆에 추가

---

### 3. 엣지 시각화 (`components/editor/edges/relationship-edge.tsx`)

**작업:**
- Composition/Aggregation 관계에 다이아몬드 마커 적용

**구현:**
```tsx
// components/editor/edges/relationship-edge.tsx

// RelationType에 따른 마커 ID 결정
const getMarkerStart = (type: RelationType) => {
  switch (type) {
    case RelationType.Composition:
      return "url(#composition)"
    case RelationType.Aggregation:
      return "url(#aggregation)"
    default:
      return undefined
  }
}

// EdgeLabelRenderer 안에서 사용
<BaseEdge
  path={edgePath}
  markerEnd="url(#arrow)"
  markerStart={getMarkerStart(data.type)} // 추가
  style={{
    stroke: "hsl(var(--foreground))",
    strokeWidth: 2,
  }}
/>
```

**파일:** `components/editor/edges/relationship-edge.tsx`
**라인:** BaseEdge 렌더링 부분 (약 50-60줄)

---

### 4. 관계 선택 UI (`components/editor/panels/relationship-edit-panel.tsx`)

**작업:**
- RelationType 선택에 Composition/Aggregation 추가

**구현:**
```tsx
// components/editor/panels/relationship-edit-panel.tsx

<Select
  value={editedData.type}
  onValueChange={(value) => {
    setEditedData({
      ...editedData,
      type: value as RelationType,
    })
  }}
>
  <SelectContent>
    {/* 기존 옵션 */}
    <SelectItem value={RelationType.OneToOne}>One to One</SelectItem>
    <SelectItem value={RelationType.OneToMany}>One to Many</SelectItem>
    <SelectItem value={RelationType.ManyToOne}>Many to One</SelectItem>
    <SelectItem value={RelationType.ManyToMany}>Many to Many</SelectItem>

    {/* 신규 옵션 */}
    <SelectItem value={RelationType.Composition}>
      Composition (◆ 강한 결합)
    </SelectItem>
    <SelectItem value={RelationType.Aggregation}>
      Aggregation (◇ 약한 결합)
    </SelectItem>
  </SelectContent>
</Select>
```

**파일:** `components/editor/panels/relationship-edit-panel.tsx`
**라인:** RelationType 선택 드롭다운 부분

---

### 5. 코드 생성 로직 (`lib/mikro-orm/generators/relationship.ts`)

**작업:**
- Composition → `orphanRemoval: true`
- Aggregation → `orphanRemoval: false`

**구현:**
```typescript
// lib/mikro-orm/generators/relationship.ts

export function generateRelationshipDecorator(
  relationship: RelationshipEdge,
  // ...
): string {
  // ...

  // Composition/Aggregation → OneToMany로 변환
  let mikroOrmType = relationship.type
  let autoOrphanRemoval = false

  if (relationship.type === RelationType.Composition) {
    mikroOrmType = RelationType.OneToMany
    autoOrphanRemoval = true
  } else if (relationship.type === RelationType.Aggregation) {
    mikroOrmType = RelationType.OneToMany
    autoOrphanRemoval = false
  }

  // orphanRemoval 옵션 추가
  const options: string[] = []

  if (autoOrphanRemoval || relationship.orphanRemoval) {
    options.push("orphanRemoval: true")
  }

  // ...
}
```

**파일:** `lib/mikro-orm/generators/relationship.ts`
**함수:** `generateRelationshipDecorator`

**생성 예시:**
```typescript
// Composition 관계
@OneToMany(() => Engine, (engine) => engine.car, {
  cascade: [Cascade.ALL],
  orphanRemoval: true, // 자동 추가
})
engines: Collection<Engine>;

// Aggregation 관계
@OneToMany(() => Professor, (prof) => prof.university, {
  cascade: [Cascade.ALL],
  orphanRemoval: false, // 명시적으로 false
})
professors: Collection<Professor>;
```

---

## 병렬 처리 전략

**순차적 작업:**
1. 타입 정의 (`types/relationship.ts`) - **먼저 완료 필요**

**병렬 처리 가능:**
2. 엣지 마커 생성 (`edge-markers.tsx`)
3. 엣지 시각화 (`relationship-edge.tsx`)
4. UI 컴포넌트 (`relationship-edit-panel.tsx`)
5. 코드 생성 로직 (`relationship.ts`)

**서브 에이전트 할당 제안:**
- Agent 1: 타입 정의 → 엣지 마커 + 시각화
- Agent 2: UI 컴포넌트 → 코드 생성 로직

---

## 기존 코드에 영향을 주지 않는 방법

1. **기존 RelationType은 그대로 유지**
   - OneToOne, OneToMany, ManyToOne, ManyToMany는 변경 없음

2. **마커는 조건부 렌더링**
   - `markerStart`는 Composition/Aggregation일 때만 적용
   - 기존 관계는 `markerEnd`만 사용 (기존 동작 유지)

3. **코드 생성은 변환 로직 사용**
   - Composition/Aggregation → OneToMany로 변환 후 생성
   - MikroORM에는 영향 없음

---

## 완료 조건

- [ ] `types/relationship.ts`에 Composition/Aggregation 추가
- [ ] `edge-markers.tsx`에 다이아몬드 마커 추가
- [ ] `relationship-edge.tsx`에 마커 적용 로직 추가
- [ ] `relationship-edit-panel.tsx`에 선택 옵션 추가
- [ ] `relationship.ts`에 orphanRemoval 자동 설정 로직 추가
- [ ] 시각적 테스트 (다이아몬드 마커 렌더링 확인)
- [ ] 코드 생성 테스트 (orphanRemoval 옵션 확인)
- [ ] `bun run lint` 통과
- [ ] `bun run build` 성공

---

## 예상 소요 시간

- 타입 정의: 5분
- 엣지 마커: 20분
- 엣지 시각화: 15분
- UI 컴포넌트: 10분
- 코드 생성 로직: 20분
- 테스트: 20분
- **총 예상 시간: 1시간 30분**

---

## 시각적 변경 사항

**Composition (◆):**
```
[Order] ◆────→ [OrderItem]
(주문 삭제 시 주문 항목도 삭제)
```

**Aggregation (◇):**
```
[University] ◇────→ [Professor]
(대학 삭제 시 교수는 유지)
```
