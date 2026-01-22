# Update Plan - Developer Requirements 구현

이 디렉토리는 `developer-requirements.md`에 명시된 요청사항을 충족하기 위한 우선순위별 구현 계획을 담고 있습니다.

---

## 우선순위 개요

| 우선순위 | 작업 | 난이도 | 예상 시간 | 병렬 처리 |
|---------|------|--------|----------|----------|
| 1 | DeleteRule 설정 추가 | 낮음 | 45분 | ✅ 가능 |
| 2 | 스테레오 타입 표기 개선 | 낮음 | 35분 | ✅ 가능 |
| 3 | Composition/Aggregation 관계 추가 | 중간 | 1시간 30분 | ⚠️ 부분 가능 |
| 4 | Aggregate Root 추가 | 중간 | 1시간 5분 | ✅ 가능 |
| 5 | VO 타입 추가 | 낮음 | 0분 | ⚠️ Priority 02에 포함 |
| 6 | Inheritance/Implementation 관계 추가 | 중간 | 2시간 | ⚠️ 부분 가능 |
| 7 | Interface 타입 추가 | 높음 | 3시간 20분 | ✅ 가능 |
| 8 | Dependency 관계 추가 | 낮음 | 25분 | ✅ 가능 |

**총 예상 시간:** 약 9시간 (병렬 처리 시 약 4-5시간)

---

## 구현 전략

### Phase 1: 기초 작업 (병렬 처리 가능)
- **Priority 01** - DeleteRule 설정 추가
- **Priority 02** - 스테레오 타입 표기 개선
- **Priority 04** - Aggregate Root 추가

**예상 시간:** 1시간 30분 (병렬 처리 시)

---

### Phase 2: 관계 타입 확장 (순차/병렬 혼합)
- **Priority 03** - Composition/Aggregation 관계 추가
- **Priority 06** - Inheritance/Implementation 관계 추가
- **Priority 08** - Dependency 관계 추가

**의존성:** RelationType enum 확장 → 각 관계 구현 병렬
**예상 시간:** 2시간 (병렬 처리 시)

---

### Phase 3: 고급 기능 (독립적)
- **Priority 07** - Interface 타입 추가

**예상 시간:** 3시간 20분

---

## 병렬 처리 전략

### 동시 진행 가능한 작업

**Phase 1 (3개 작업 병렬):**
- Agent 1: Priority 01 (DeleteRule)
- Agent 2: Priority 02 (스테레오 타입)
- Agent 3: Priority 04 (Aggregate Root)

**Phase 2 (타입 정의 후 병렬):**
1. `types/relationship.ts` 확장 (순차)
2. 병렬 처리:
   - Agent 1: Composition/Aggregation
   - Agent 2: Inheritance/Implementation
   - Agent 3: Dependency

**Phase 3 (독립적):**
- Agent 1: Interface 타입 (단독 진행)

---

## 핵심 원칙

### 1. 기존 코드 보호
- 모든 새 기능은 **옵션**으로 추가
- 기존 타입/인터페이스는 **확장만** (변경 금지)
- 기존 노드/엣지는 **영향 없음**

### 2. 일관된 패턴
- 노드 컴포넌트: `shared/` 컴포넌트 재사용
- 엣지 시각화: `edge-markers.tsx` 활용
- 코드 생성: `lib/mikro-orm/generators/` 구조 유지

### 3. 테스트 필수
- 각 우선순위 완료 후:
  - `bun run lint` 통과
  - `bun run build` 성공
  - 시각적 렌더링 확인
  - 코드 생성 검증

---

## 파일 구조

```text
update/
├── README.md                         # 이 파일
├── priority-01-delete-rule.md        # DeleteRule 설정 추가
├── priority-02-stereotype-display.md # 스테레오 타입 표기 개선
├── priority-03-composition-aggregation.md # Composition/Aggregation 관계
├── priority-04-aggregate-root.md     # Aggregate Root 추가
├── priority-05-vo-type.md            # VO 타입 (Priority 02에 포함)
├── priority-06-inheritance-implementation.md # 상속/구현 관계
├── priority-07-interface-type.md     # Interface 타입 추가
└── priority-08-dependency.md         # Dependency 관계 추가
```

---

## 영향 받는 컴포넌트 요약

| 컴포넌트 | 우선순위 |
|---------|---------|
| **사이드 메뉴** | 3, 4, 7 |
| **캔버스** | 2, 3, 4, 6, 7, 8 |
| **프로퍼티 설정 사이드바** | 1, 3, 6, 7 |
| **Export Code** | 1, 3, 4, 6, 7, 8 |

---

## 체크리스트

### Phase 1
- [ ] Priority 01 완료 및 테스트
- [ ] Priority 02 완료 및 테스트
- [ ] Priority 04 완료 및 테스트
- [ ] Phase 1 통합 테스트

### Phase 2
- [ ] Priority 03 완료 및 테스트
- [ ] Priority 06 완료 및 테스트
- [ ] Priority 08 완료 및 테스트
- [ ] Phase 2 통합 테스트

### Phase 3
- [ ] Priority 07 완료 및 테스트

### 최종 검증
- [ ] 모든 노드 타입 렌더링 확인
- [ ] 모든 관계 타입 시각화 확인
- [ ] 전체 코드 생성 검증
- [ ] E2E 테스트 (다이어그램 생성 → 코드 Export)
- [ ] `bun run lint` 통과
- [ ] `bun run build` 성공

---

## 질문 및 결정사항

### 사용자 답변 기반 결정

1. **Aggregate Root vs Entity**
   - 코드 생성 동일 (`@Entity()`)
   - 시각적 표기만 `<<Root>>` vs `<<Entity>>`

2. **VO vs Embeddable**
   - 같은 개념
   - 코드 생성 동일 (`@Embeddable()`)
   - `embeddable` 타입 이름 유지, 스테레오 타입만 `<<VO>>`

3. **Interface 멤버**
   - 속성 + 메서드 시그니처 모두 지원

4. **Composition/Aggregation 차이**
   - `orphanRemoval: true` vs `false`

---

## 참고 자료

- [Developer Requirements](/Users/andy/Documents/GitHub/ureca-mikro-orm-visualizer/developer-requirements.md)
- [CLAUDE.md](/Users/andy/Documents/GitHub/ureca-mikro-orm-visualizer/CLAUDE.md)
- [MikroORM Relations](https://mikro-orm.io/docs/relationships)
- [UML Class Diagrams](https://www.uml-diagrams.org/class-diagrams-overview.html)
