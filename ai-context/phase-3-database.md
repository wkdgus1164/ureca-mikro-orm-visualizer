# Phase 3: 데이터베이스 연동

**목표**: SQL DDL export (PostgreSQL, MySQL), DDL/JSON import

**예상 완료 기간**: 1-2주

**의존성**: Phase 2 완료 필수

---

## 진행 상황

- [ ] PostgreSQL DDL export
- [ ] MySQL DDL export
- [ ] PostgreSQL DDL import (파싱)
- [ ] JSON import
- [ ] 데이터베이스별 타입 매핑
- [ ] DDL 미리보기 및 검증

---

## 핵심 목표

1. ✅ PostgreSQL, MySQL DDL (CREATE TABLE) 생성 가능
2. ✅ PostgreSQL DDL을 파싱하여 다이어그램으로 import 가능
3. ✅ JSON Schema를 import하여 다이어그램으로 변환 가능
4. ✅ 데이터베이스별 타입 매핑 정확성 확보

---

## 필수 기능

### 1. SQL DDL Export (PostgreSQL)

**기능:**
- Entity → CREATE TABLE 문 생성
- Property → 컬럼 정의
- Relationship → FOREIGN KEY 제약조건
- Index, Unique 제약조건

**예시 출력:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_author ON posts(author_id);
```

**타입 매핑:**
- string → VARCHAR(255)
- number → INTEGER (PK는 SERIAL)
- boolean → BOOLEAN
- Date → TIMESTAMP

---

### 2. SQL DDL Export (MySQL)

**기능:**
- PostgreSQL과 유사하지만 MySQL 문법 사용
- AUTO_INCREMENT, ENGINE=InnoDB 등

**예시 출력:**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_posts_author ON posts(author_id);
```

---

### 3. PostgreSQL DDL Import

**기능:**
- SQL DDL 파일 업로드
- CREATE TABLE 문 파싱
- Entity 노드 생성
- FOREIGN KEY → Relationship 엣지 생성

**파서 구현:**
- SQL 파서 라이브러리 사용 (node-sql-parser 등)
- 또는 정규표현식 기반 간단한 파서

**UI:**
- 툴바 "Import" 버튼
- 파일 선택 (`.sql`)
- 파싱 결과 미리보기
- "Import" 확인 버튼

---

### 4. JSON Import

**기능:**
- Phase 2에서 export한 JSON Schema import
- 또는 다른 도구에서 export한 JSON

**UI:**
- Import 모달에서 JSON 파일 선택
- JSON 검증
- 다이어그램 생성

---

### 5. 데이터베이스별 타입 매핑

**타입 매핑 테이블:**

| MikroORM Type | PostgreSQL | MySQL |
|---------------|------------|-------|
| string        | VARCHAR(255) | VARCHAR(255) |
| number (PK)   | SERIAL     | INT AUTO_INCREMENT |
| number        | INTEGER    | INT |
| boolean       | BOOLEAN    | TINYINT(1) |
| Date          | TIMESTAMP  | TIMESTAMP |

**커스텀 타입:**
- 사용자가 정의한 타입은 그대로 사용 (예: UUID → UUID)

---

## 작업 단위 (Task Breakdown)

### Task 3.1: PostgreSQL DDL 생성 로직 구현

**담당**: SQL Generator
**예상 난이도**: High
**의존성**: Phase 2 완료

**세부 작업:**
1. `lib/export/sql.ts` 생성
2. `generatePostgreSQLDDL` 함수 구현
3. Entity → CREATE TABLE
4. Relationship → FOREIGN KEY

**완료 조건:**
- [ ] generatePostgreSQLDDL 함수 구현
- [ ] 타입 매핑 정확성
- [ ] FOREIGN KEY 생성
- [ ] Index, Unique 제약조건

**커밋 메시지 템플릿:**
```
feat(export): PostgreSQL DDL 생성 로직 구현

- lib/export/sql.ts 생성
- generatePostgreSQLDDL 함수로 Entity → CREATE TABLE 변환
- 타입 매핑 (string → VARCHAR, number → INTEGER 등)
- FOREIGN KEY 제약조건 생성
- Index, Unique 제약조건 추가

관련 Task: Phase 3 - Task 3.1
```

---

### Task 3.2: MySQL DDL 생성 로직 구현

**담당**: SQL Generator
**예상 난이도**: Medium
**의존성**: Task 3.1 완료

**세부 작업:**
1. `generateMySQLDDL` 함수 추가
2. MySQL 문법 적용 (AUTO_INCREMENT, ENGINE 등)

**완료 조건:**
- [ ] generateMySQLDDL 함수 구현
- [ ] MySQL 타입 매핑
- [ ] ENGINE=InnoDB 추가

**커밋 메시지 템플릿:**
```
feat(export): MySQL DDL 생성 로직 구현

- generateMySQLDDL 함수 추가
- MySQL 문법 적용 (AUTO_INCREMENT, ENGINE=InnoDB)
- 타입 매핑 (TINYINT(1) for boolean 등)

관련 Task: Phase 3 - Task 3.2
```

---

### Task 3.3: SQL DDL 파서 구현

**담당**: DDL Parser
**예상 난이도**: High
**의존성**: Phase 2 완료

**세부 작업:**
1. `lib/import/ddl-parser.ts` 생성
2. SQL 파서 라이브러리 설치 (node-sql-parser)
3. CREATE TABLE 파싱
4. FOREIGN KEY 파싱

**완료 조건:**
- [ ] DDL 파싱 함수 구현
- [ ] Entity 노드 생성
- [ ] Relationship 엣지 생성
- [ ] 오류 처리

**커밋 메시지 템플릿:**
```
feat(import): SQL DDL 파서 구현

- lib/import/ddl-parser.ts 생성
- node-sql-parser로 CREATE TABLE 파싱
- Entity 노드 및 Relationship 엣지 생성
- FOREIGN KEY → ManyToOne/OneToMany 변환
- 파싱 오류 처리

관련 Task: Phase 3 - Task 3.3
```

---

### Task 3.4: Import UI 구현

**담당**: Import UI
**예상 난이도**: Medium
**의존성**: Task 3.3 완료

**세부 작업:**
1. Import 모달 생성
2. 파일 업로드 UI
3. 파싱 결과 미리보기
4. Import 확인 및 캔버스 업데이트

**완료 조건:**
- [ ] Import 모달 UI
- [ ] 파일 선택 및 업로드
- [ ] 파싱 결과 미리보기
- [ ] Import 확인 시 노드/엣지 추가

**커밋 메시지 템플릿:**
```
feat(import): Import UI 구현

- Import 모달 생성
- 파일 업로드 UI (DDL, JSON)
- 파싱 결과 미리보기 테이블
- Import 확인 시 캔버스에 노드/엣지 추가

관련 Task: Phase 3 - Task 3.4
```

---

## 제외 사항

Phase 3에서 구현하지 않는 것들:
- ❌ 실시간 데이터베이스 연결 (추후 고려)
- ❌ Migration 파일 생성 (추후 고려)
- ❌ ORM 외 다른 도구 지원 (Prisma, Sequelize 등)

---

## 성공 메트릭

Phase 3 완료 기준:
1. ✅ PostgreSQL DDL export 가능
2. ✅ MySQL DDL export 가능
3. ✅ PostgreSQL DDL import 및 다이어그램 생성 가능
4. ✅ JSON import 가능
5. ✅ 타입 매핑 정확성 검증

---

## 다음 단계

Phase 3 완료 후:
- Phase 4 시작: UI/UX 개선, 성능 최적화
