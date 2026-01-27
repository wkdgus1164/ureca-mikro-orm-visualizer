/**
 * AI Tool 스키마 정의
 *
 * 모든 노드(Entity, Embeddable, Enum, Interface) 및
 * 엣지(Relationship, EnumMapping) 타입에 대한 CRUD Tool 정의
 */

import { tool } from "ai"
import { z } from "zod"

// ============================================
// 공통 스키마
// ============================================

const propertySchema = z.object({
  name: z.string().describe("프로퍼티 이름"),
  type: z
    .enum(["string", "number", "boolean", "Date", "uuid", "bigint", "Buffer"])
    .describe("프로퍼티 타입"),
  isPrimaryKey: z.boolean().optional().describe("Primary Key 여부"),
  isUnique: z.boolean().optional().describe("Unique 제약 조건"),
  isNullable: z.boolean().optional().describe("Nullable 여부"),
  defaultValue: z.string().optional().describe("기본값"),
})

const enumValueSchema = z.object({
  key: z.string().describe("Enum 키 (예: Admin, User)"),
  value: z.string().describe("Enum 값 (예: admin, user)"),
})

const relationTypeSchema = z.enum([
  "OneToOne",
  "OneToMany",
  "ManyToOne",
  "ManyToMany",
  "Composition",
  "Aggregation",
  "Inheritance",
  "Implementation",
  "Dependency",
])

// ============================================
// Entity Tools
// ============================================

export const addEntityTool = tool({
  description: "캔버스에 새로운 Entity 노드를 추가합니다. MikroORM @Entity 클래스입니다.",
  inputSchema: z.object({
    name: z.string().describe("엔티티 이름 (예: User, Post, Comment)"),
    tableName: z
      .string()
      .optional()
      .describe("커스텀 테이블명 (기본: 엔티티명의 snake_case)"),
    properties: z.array(propertySchema).optional().describe("프로퍼티 목록"),
  }),
})

export const updateEntityTool = tool({
  description: "기존 Entity의 이름이나 테이블명을 수정합니다.",
  inputSchema: z.object({
    targetName: z.string().describe("수정할 엔티티 이름"),
    newName: z.string().optional().describe("새 엔티티 이름"),
    newTableName: z.string().optional().describe("새 테이블명"),
  }),
})

export const deleteEntityTool = tool({
  description: "Entity를 삭제합니다. 관련된 Relationship도 함께 삭제됩니다.",
  inputSchema: z.object({
    name: z.string().describe("삭제할 엔티티 이름"),
  }),
})

// ============================================
// Embeddable Tools
// ============================================

export const addEmbeddableTool = tool({
  description:
    "새로운 Embeddable 노드를 추가합니다. MikroORM @Embeddable 값 객체입니다.",
  inputSchema: z.object({
    name: z.string().describe("Embeddable 이름 (예: Address, Metadata)"),
    properties: z
      .array(propertySchema.omit({ isPrimaryKey: true }))
      .optional()
      .describe("프로퍼티 목록"),
  }),
})

export const updateEmbeddableTool = tool({
  description: "기존 Embeddable의 이름을 수정합니다.",
  inputSchema: z.object({
    targetName: z.string().describe("수정할 Embeddable 이름"),
    newName: z.string().describe("새 Embeddable 이름"),
  }),
})

export const deleteEmbeddableTool = tool({
  description: "Embeddable을 삭제합니다.",
  inputSchema: z.object({
    name: z.string().describe("삭제할 Embeddable 이름"),
  }),
})

// ============================================
// Enum Tools
// ============================================

export const addEnumTool = tool({
  description: "새로운 Enum 타입을 추가합니다. TypeScript enum으로 생성됩니다.",
  inputSchema: z.object({
    name: z.string().describe("Enum 이름 (예: UserRole, OrderStatus)"),
    values: z
      .array(enumValueSchema)
      .describe("Enum 값 목록 (key: 식별자, value: 실제 값)"),
  }),
})

export const updateEnumTool = tool({
  description: "기존 Enum의 이름이나 값을 수정합니다.",
  inputSchema: z.object({
    targetName: z.string().describe("수정할 Enum 이름"),
    newName: z.string().optional().describe("새 Enum 이름"),
    values: z.array(enumValueSchema).optional().describe("새 Enum 값 목록"),
  }),
})

export const deleteEnumTool = tool({
  description:
    "Enum을 삭제합니다. 이 Enum을 사용하는 EnumMapping도 함께 삭제됩니다.",
  inputSchema: z.object({
    name: z.string().describe("삭제할 Enum 이름"),
  }),
})

// ============================================
// Interface Tools
// ============================================

export const addInterfaceTool = tool({
  description:
    "새로운 Interface 노드를 추가합니다. TypeScript interface로 생성됩니다.",
  inputSchema: z.object({
    name: z.string().describe("Interface 이름 (예: Auditable, Timestamped)"),
    properties: z
      .array(propertySchema.omit({ isPrimaryKey: true }))
      .optional()
      .describe("프로퍼티 목록"),
    methods: z
      .array(
        z.object({
          name: z.string().describe("메서드 이름"),
          inputSchema: z
            .string()
            .describe("파라미터 (예: 'id: number, name: string')"),
          returnType: z.string().describe("반환 타입"),
        })
      )
      .optional()
      .describe("메서드 시그니처 목록"),
  }),
})

export const updateInterfaceTool = tool({
  description: "기존 Interface의 이름을 수정합니다.",
  inputSchema: z.object({
    targetName: z.string().describe("수정할 Interface 이름"),
    newName: z.string().describe("새 Interface 이름"),
  }),
})

export const deleteInterfaceTool = tool({
  description: "Interface를 삭제합니다.",
  inputSchema: z.object({
    name: z.string().describe("삭제할 Interface 이름"),
  }),
})

// ============================================
// Property Tools
// ============================================

export const addPropertyTool = tool({
  description: "기존 Entity, Embeddable, Interface에 프로퍼티를 추가합니다.",
  inputSchema: z.object({
    nodeName: z.string().describe("대상 노드 이름"),
    property: propertySchema.describe("추가할 프로퍼티"),
  }),
})

export const updatePropertyTool = tool({
  description: "기존 프로퍼티를 수정합니다.",
  inputSchema: z.object({
    nodeName: z.string().describe("대상 노드 이름"),
    propertyName: z.string().describe("수정할 프로퍼티 이름"),
    updates: propertySchema.partial().describe("수정할 내용"),
  }),
})

export const deletePropertyTool = tool({
  description: "프로퍼티를 삭제합니다.",
  inputSchema: z.object({
    nodeName: z.string().describe("대상 노드 이름"),
    propertyName: z.string().describe("삭제할 프로퍼티 이름"),
  }),
})

// ============================================
// Relationship Tools
// ============================================

export const addRelationshipTool = tool({
  description: "두 Entity 간의 관계를 추가합니다.",
  inputSchema: z.object({
    sourceEntity: z.string().describe("출발 엔티티 이름"),
    targetEntity: z.string().describe("도착 엔티티 이름"),
    relationType: relationTypeSchema.describe("관계 타입"),
    sourceProperty: z.string().describe("출발 엔티티의 관계 프로퍼티명"),
    targetProperty: z
      .string()
      .optional()
      .describe("양방향 관계 시 도착 엔티티의 프로퍼티명"),
    isNullable: z.boolean().optional().describe("Nullable 여부"),
    cascade: z.boolean().optional().describe("Cascade 옵션"),
  }),
})

export const updateRelationshipTool = tool({
  description: "기존 관계의 속성을 수정합니다.",
  inputSchema: z.object({
    sourceEntity: z.string().describe("출발 엔티티 이름"),
    targetEntity: z.string().describe("도착 엔티티 이름"),
    updates: z
      .object({
        relationType: relationTypeSchema.optional(),
        sourceProperty: z.string().optional(),
        targetProperty: z.string().optional(),
        isNullable: z.boolean().optional(),
        cascade: z.boolean().optional(),
      })
      .describe("수정할 내용"),
  }),
})

export const deleteRelationshipTool = tool({
  description: "관계를 삭제합니다.",
  inputSchema: z.object({
    sourceEntity: z.string().describe("출발 엔티티 이름"),
    targetEntity: z.string().describe("도착 엔티티 이름"),
  }),
})

// ============================================
// EnumMapping Tools
// ============================================

export const addEnumMappingTool = tool({
  description: "Entity의 프로퍼티를 Enum 타입으로 매핑합니다.",
  inputSchema: z.object({
    entityName: z.string().describe("엔티티 이름"),
    propertyName: z.string().describe("Enum으로 변경할 프로퍼티 이름"),
    enumName: z.string().describe("연결할 Enum 이름"),
  }),
})

export const deleteEnumMappingTool = tool({
  description: "Enum 매핑을 제거하고 프로퍼티를 원래 타입으로 복원합니다.",
  inputSchema: z.object({
    entityName: z.string().describe("엔티티 이름"),
    propertyName: z.string().describe("매핑을 제거할 프로퍼티 이름"),
  }),
})

// ============================================
// Diagram Tools
// ============================================

export const clearDiagramTool = tool({
  description: "전체 다이어그램을 초기화합니다. 모든 노드와 엣지가 삭제됩니다.",
  inputSchema: z.object({
    confirm: z.literal(true).describe("true로 설정해야 삭제 실행"),
  }),
})

export const getDiagramSummaryTool = tool({
  description: "현재 다이어그램의 요약 정보를 조회합니다.",
  inputSchema: z.object({}),
})

// ============================================
// Code Generation Tools
// ============================================

export const generateCodeTool = tool({
  description: "현재 다이어그램을 TypeScript/MikroORM 코드로 생성합니다.",
  inputSchema: z.object({
    target: z
      .enum(["all", "entity", "embeddable", "enum", "interface"])
      .optional()
      .describe("생성할 대상. 기본값: all"),
    entityName: z
      .string()
      .optional()
      .describe("특정 엔티티만 생성할 경우 이름 지정"),
  }),
})

export const previewCodeTool = tool({
  description: "특정 Entity/Enum/Interface의 코드 미리보기를 보여줍니다.",
  inputSchema: z.object({
    nodeName: z.string().describe("미리볼 노드 이름"),
  }),
})

// ============================================
// HITL (Human-in-the-Loop) Tools
// ============================================

export const askUserTool = tool({
  description: `사용자에게 질문하여 명확한 정보를 얻습니다. 다음 상황에서 반드시 사용하세요:
- 요청이 모호하거나 여러 해석이 가능할 때
- 관계 타입(1:1, 1:N, N:M)이 명시되지 않았을 때
- 프로퍼티 타입이나 제약조건이 불분명할 때
- 엔티티 이름이나 구조에 대한 확인이 필요할 때
- 여러 선택지 중 사용자의 선호를 확인해야 할 때`,
  inputSchema: z.object({
    question: z.string().describe("사용자에게 표시할 질문"),
    type: z
      .enum(["text", "single-choice", "multiple-choice"])
      .describe("응답 유형: text(주관식), single-choice(단답 객관식), multiple-choice(복수선택 객관식)"),
    options: z
      .array(
        z.object({
          value: z.string().describe("선택지 값 (내부 처리용)"),
          label: z.string().describe("선택지 표시 텍스트"),
          description: z.string().optional().describe("선택지에 대한 추가 설명"),
        })
      )
      .optional()
      .describe("객관식일 경우 선택지 목록 (text 타입에서는 무시됨)"),
    defaultValue: z.string().optional().describe("기본 선택값 또는 placeholder"),
  }),
})

// ============================================
// 모든 Tool 내보내기
// ============================================

export const diagramTools = {
  // Entity
  addEntity: addEntityTool,
  updateEntity: updateEntityTool,
  deleteEntity: deleteEntityTool,

  // Embeddable
  addEmbeddable: addEmbeddableTool,
  updateEmbeddable: updateEmbeddableTool,
  deleteEmbeddable: deleteEmbeddableTool,

  // Enum
  addEnum: addEnumTool,
  updateEnum: updateEnumTool,
  deleteEnum: deleteEnumTool,

  // Interface
  addInterface: addInterfaceTool,
  updateInterface: updateInterfaceTool,
  deleteInterface: deleteInterfaceTool,

  // Property
  addProperty: addPropertyTool,
  updateProperty: updatePropertyTool,
  deleteProperty: deletePropertyTool,

  // Relationship
  addRelationship: addRelationshipTool,
  updateRelationship: updateRelationshipTool,
  deleteRelationship: deleteRelationshipTool,

  // EnumMapping
  addEnumMapping: addEnumMappingTool,
  deleteEnumMapping: deleteEnumMappingTool,

  // Diagram
  clearDiagram: clearDiagramTool,
  getDiagramSummary: getDiagramSummaryTool,

  // Code Generation
  generateCode: generateCodeTool,
  previewCode: previewCodeTool,

  // HITL
  askUser: askUserTool,
}

/**
 * Tool 이름 타입
 */
export type DiagramToolName = keyof typeof diagramTools
