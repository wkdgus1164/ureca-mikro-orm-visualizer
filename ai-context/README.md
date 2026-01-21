# ai-context/

AI 개발 에이전트를 위한 컨텍스트 및 프로젝트 문서 디렉토리.

## 목적

Claude Code 및 기타 AI 에이전트가 프로젝트를 이해하고 작업할 수 있도록:
- **PRD (Product Requirements Document)**: Phase별 개발 요구사항
- **Architecture Decision Records (ADR)**: 중요한 아키텍처 결정 기록
- **Progress Tracking**: 진행 상황 및 완료된 작업 추적

## 구조

```
ai-context/
├── README.md
├── phase-1-mvp.md              # Phase 1: MVP 기능
├── phase-2-advanced.md         # Phase 2: 고급 기능
├── phase-3-database.md         # Phase 3: DB 연동
├── phase-4-optimization.md     # Phase 4: 최적화
├── adr/                        # Architecture Decision Records
│   ├── 001-use-reactflow.md
│   ├── 002-mikro-orm-version.md
│   └── ...
└── progress/                   # 진행 상황 추적
    ├── 2026-01-w1.md
    └── ...
```

## PRD 작성 규칙

각 Phase PRD는 다음 구조를 따릅니다:

```markdown
# Phase X: [Phase 이름]

## 진행 상황
- [ ] 작업 1
- [ ] 작업 2
- [x] 완료된 작업

## 목표
[Phase의 핵심 목표 및 달성 기준]

## 필수 기능
[반드시 구현해야 할 기능들 - 선택사항 없음]

## 기술 요구사항
[사용할 기술 스택, 라이브러리, 패턴]

## 작업 단위 (Task Breakdown)
### Task 1.1: [작업명]
- **담당**: [역할]
- **예상 난이도**: [Low/Medium/High]
- **의존성**: Task 1.0 완료 후
- **완료 조건**:
  - [ ] 조건 1
  - [ ] 조건 2
- **커밋 메시지 템플릿**:
  ```
  feat(editor): 작업 내용을 상세히 설명

  - 구현한 기능 1
  - 구현한 기능 2

  관련 이슈: #123
  ```

## 제외 사항
[이 Phase에서 하지 않을 것들]

## 성공 메트릭
[Phase 완료 기준]
```

## ADR 작성 규칙

Architecture Decision Record는 다음 형식을 따릅니다:

```markdown
# ADR-XXX: [결정 제목]

**날짜**: YYYY-MM-DD
**상태**: [제안중/승인됨/폐기됨/대체됨]

## 컨텍스트
[결정이 필요한 배경 및 문제]

## 고려한 옵션
1. **옵션 A**: [설명]
   - 장점: ...
   - 단점: ...
2. **옵션 B**: [설명]
   - 장점: ...
   - 단점: ...

## 결정
[선택한 옵션과 이유]

## 결과
[이 결정이 미치는 영향]

## 참고자료
- [링크 1]
- [링크 2]
```

## 진행 상황 추적

주간 단위로 진행 상황을 기록합니다:

```markdown
# 진행 상황: 2026-01-W1 (1월 1주차)

## 완료된 작업
- [x] Task 1.1: 프로젝트 초기 설정
  - Commit: abc1234 "feat: 프로젝트 초기 설정 완료"
- [x] Task 1.2: 디렉토리 구조 설계
  - Commit: def5678 "docs: 디렉토리 구조 및 README 작성"

## 진행 중인 작업
- [ ] Task 1.3: ReactFlow 기본 캔버스 구현 (50%)

## 다음 주 계획
- Task 1.3 완료
- Task 1.4 시작

## 이슈 및 블로커
- 없음

## 배운 점 / 개선 사항
- ReactFlow v12 문서 참고 필요
```

## 커밋 메시지 규칙

**모든 작업 단위 완료 시 반드시 한글 커밋 메시지 작성**:

```bash
git add .
git commit -m "feat(scope): 간단한 한 줄 요약

- 구현한 기능이나 변경 사항을 상세히 나열
- 왜 이렇게 구현했는지 배경 설명
- 관련된 파일이나 컴포넌트 언급

관련 이슈: #123
참고: https://..."
```

**커밋 타입**:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 설정, 패키지 매니저 등

**Scope 예시**:
- `editor`: 에디터 관련
- `export`: 내보내기 기능
- `import`: 불러오기 기능
- `ui`: UI 컴포넌트
- `types`: 타입 정의
- `lib`: 라이브러리 유틸리티

## 주의사항

1. **선택사항 금지**: PRD에 "선택사항"이나 "가능하면"은 포함하지 않음
   - 필수면 필수 기능에 포함
   - 아니면 다음 Phase로 이동 또는 제외

2. **명확한 완료 조건**: 모든 Task는 체크리스트 형태의 명확한 완료 조건 포함

3. **의존성 명시**: Task 간 의존성을 명확히 표시하여 순서 보장

4. **실시간 업데이트**: Phase 진행 중 진행 상황 체크박스를 실시간으로 업데이트
