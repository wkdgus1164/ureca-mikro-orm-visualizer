# Priority 01: DeleteRule 설정 추가

## 개요
엔티티 간 관계에서 부모 엔티티 삭제 시 자식 엔티티의 동작을 제어하는 `deleteRule` 옵션을 추가합니다.

**난이도:** 낮음
**병렬 처리:** 가능 (다른 우선순위 작업과 독립적)
**기존 코드 영향:** 최소 (옵션 추가만 진행)

---

## 영향받는 컴포넌트

| 컴포넌트 | 변경 사항 |
|---------|----------|
| ✅ 사이드 메뉴 | 영향 없음 |
| ✅ 캔버스 | 영향 없음 (엣지 시각화는 동일) |
| ✅ 프로퍼티 설정 사이드바 | **DeleteRule 선택 드롭다운 추가** |
| ✅ Export Code | **MikroORM `onDelete` 옵션 생성** |

---

## 구체적인 작업 항목

### 1. 타입 정의 (`types/relationship.ts`)

**작업:**
```typescript
// DeleteRule enum 추가
export enum DeleteRule {
  Cascade = "CASCADE",      // 부모 삭제 시 자식도 삭제
  SetNull = "SET NULL",     // 부모 삭제 시 자식의 FK를 NULL로 설정
  Restrict = "RESTRICT",    // 자식이 있으면 부모 삭제 불가
  NoAction = "NO ACTION",   // DB 기본 동작 사용
  SetDefault = "SET DEFAULT", // 부모 삭제 시 자식의 FK를 기본값으로
}

// RelationshipData에 deleteRule 속성 추가
export interface RelationshipData {
  // ... 기존 속성
  deleteRule?: DeleteRule; // 추가
}
```

**파일:** `types/relationship.ts`
**라인:** 약 28-41 (FetchType 정의 바로 아래)

---

### 2. UI 컴포넌트 (`components/editor/panels/relationship-edit-panel.tsx`)

**작업:**
- DeleteRule 선택 드롭다운 추가 (FetchType 선택과 동일한 패턴)
- 기본값: `undefined` (설정 안 함)

**구현 위치:**
- 파일: `components/editor/panels/relationship-edit-panel.tsx`
- 섹션: Cascade Options 아래에 새로운 섹션 추가
- 라인: 약 270-280 (Cascade 옵션 바로 아래)

**UI 구조:**
```tsx
{/* Delete Rule */}
<div className="space-y-3">
  <Label>Delete Rule</Label>
  <Select
    value={editedData.deleteRule ?? "none"}
    onValueChange={(value) => {
      setEditedData({
        ...editedData,
        deleteRule: value === "none" ? undefined : (value as DeleteRule),
      })
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="선택 안 함" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">선택 안 함</SelectItem>
      <SelectItem value={DeleteRule.Cascade}>CASCADE (자식도 삭제)</SelectItem>
      <SelectItem value={DeleteRule.SetNull}>SET NULL (FK를 NULL로)</SelectItem>
      <SelectItem value={DeleteRule.Restrict}>RESTRICT (삭제 차단)</SelectItem>
      <SelectItem value={DeleteRule.NoAction}>NO ACTION (DB 기본)</SelectItem>
      <SelectItem value={DeleteRule.SetDefault}>SET DEFAULT (기본값 설정)</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

### 3. 코드 생성 (`lib/mikro-orm/generators/relationship.ts`)

**작업:**
- `deleteRule`이 설정된 경우 `onDelete` 옵션 추가

**구현 위치:**
- 파일: `lib/mikro-orm/generators/relationship.ts`
- 함수: `generateRelationshipOptions`
- 라인: 약 74-76 (eager 옵션 추가 부근)

**구현 로직:**
```typescript
// FetchType이 Eager인 경우
if (relationship.fetchType === FetchType.Eager) {
  options.push("eager: true")
}

// DeleteRule이 설정된 경우 추가
if (relationship.deleteRule) {
  options.push(`onDelete: "${relationship.deleteRule}"`)
}
```

**생성 예시:**
```typescript
// deleteRule: DeleteRule.Cascade인 경우
@OneToMany(() => OrderItem, (item) => item.order, {
  cascade: [Cascade.ALL],
  onDelete: "CASCADE",
})
items: Collection<OrderItem>;
```

---

### 4. 테스트 케이스

**작업:**
- DeleteRule 선택 UI 테스트
- 코드 생성 로직 테스트

**파일:**
- `test/components/relationship-edit-panel.test.tsx` (신규)
- `test/lib/relationship-generator.test.ts` (수정)

**테스트 케이스:**
1. DeleteRule 선택 시 RelationshipData에 반영
2. DeleteRule이 undefined인 경우 `onDelete` 옵션 미생성
3. DeleteRule이 설정된 경우 올바른 `onDelete` 옵션 생성

---

## 병렬 처리 전략

**독립적으로 진행 가능한 작업:**
1. 타입 정의 (`types/relationship.ts`)
2. UI 컴포넌트 (`relationship-edit-panel.tsx`)
3. 코드 생성 로직 (`relationship.ts`)

**순차적으로 진행해야 하는 작업:**
- 없음 (타입 정의만 먼저 완료되면 나머지는 병렬 처리 가능)

**서브 에이전트 할당 제안:**
- Agent 1: 타입 정의 + UI 컴포넌트
- Agent 2: 코드 생성 로직 + 테스트

---

## 기존 코드에 영향을 주지 않는 방법

1. **옵션 필드는 optional (`deleteRule?: DeleteRule`)**
   - 기존 RelationshipData는 deleteRule이 undefined → 영향 없음

2. **코드 생성 시 조건부 추가**
   - `if (relationship.deleteRule)` 조건으로 옵션이 있을 때만 생성

3. **UI에서 기본값은 "선택 안 함"**
   - 사용자가 명시적으로 선택하지 않으면 기존 동작 유지

---

## 완료 조건

- [ ] `types/relationship.ts`에 DeleteRule enum 추가
- [ ] `RelationshipData`에 `deleteRule?: DeleteRule` 속성 추가
- [ ] `relationship-edit-panel.tsx`에 DeleteRule 선택 드롭다운 추가
- [ ] `relationship.ts`에 `onDelete` 옵션 생성 로직 추가
- [ ] 테스트 케이스 작성 및 통과
- [ ] `bun run lint` 통과
- [ ] `bun run build` 성공

---

## 예상 소요 시간

- 타입 정의: 5분
- UI 컴포넌트: 15분
- 코드 생성 로직: 10분
- 테스트: 15분
- **총 예상 시간: 45분**
