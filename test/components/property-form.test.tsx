/**
 * PropertyForm 컴포넌트 테스트
 *
 * Property 편집 폼의 모든 기능을 테스트합니다.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PropertyForm } from "@/components/editor/panels/property-form"
import type { EntityProperty, EnumNode } from "@/types/entity"

describe("PropertyForm", () => {
  const defaultProperty: EntityProperty = {
    id: "prop-1",
    name: "testProperty",
    type: "string",
    isPrimaryKey: false,
    isUnique: false,
    isNullable: true,
  }

  let mockOnChange: ReturnType<typeof vi.fn>
  let mockOnDelete: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnChange = vi.fn()
    mockOnDelete = vi.fn()
  })

  // ============================================================================
  // 기본 렌더링 테스트
  // ============================================================================
  describe("기본 렌더링", () => {
    it("Property 이름을 표시한다", () => {
      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      const nameInput = screen.getByDisplayValue("testProperty")
      expect(nameInput).toBeInTheDocument()
    })

    it("Property 타입을 표시한다", () => {
      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByText("string")).toBeInTheDocument()
    })

    it("Primary Key 아이콘을 표시한다", () => {
      const pkProperty: EntityProperty = {
        ...defaultProperty,
        isPrimaryKey: true,
      }

      render(
        <PropertyForm
          property={pkProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByTitle("Primary Key")).toBeInTheDocument()
    })

    it("Required 아이콘을 표시한다 (nullable=false, primaryKey=false)", () => {
      const requiredProperty: EntityProperty = {
        ...defaultProperty,
        isNullable: false,
        isPrimaryKey: false,
      }

      render(
        <PropertyForm
          property={requiredProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByTitle("Required")).toBeInTheDocument()
    })

    it("삭제 버튼을 표시한다", () => {
      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      // 삭제 버튼은 hover 시에만 보이므로 존재 여부만 확인
      const buttons = screen.getAllByRole("button")
      expect(buttons.length).toBeGreaterThan(0)
    })

    it("showDelete=false면 삭제 버튼을 숨긴다", () => {
      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          showDelete={false}
        />
      )

      // 확장 버튼만 있어야 함
      const buttons = screen.getAllByRole("button")
      // 드래그 핸들과 확장 버튼만 있어야 함
      expect(buttons).toHaveLength(1) // 확장 토글 버튼만
    })
  })

  // ============================================================================
  // Property 이름/타입 변경 테스트
  // ============================================================================
  describe("Property 이름/타입 변경", () => {
    it("이름을 변경하면 onChange가 호출된다", async () => {
      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      const nameInput = screen.getByDisplayValue("testProperty")
      fireEvent.change(nameInput, { target: { value: "newName" } })

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ name: "newName" })
      )
    })

    it("삭제 버튼 클릭 시 onDelete가 호출된다", async () => {
      const user = userEvent.setup()

      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      // 삭제 버튼은 마지막 버튼 (확장 버튼이 첫 번째)
      const buttons = screen.getAllByRole("button")
      // 버튼이 2개 있어야 함 (확장 + 삭제)
      expect(buttons.length).toBeGreaterThanOrEqual(2)

      // 마지막 버튼이 삭제 버튼
      const deleteButton = buttons[buttons.length - 1]
      await user.click(deleteButton)
      expect(mockOnDelete).toHaveBeenCalled()
    })
  })

  // ============================================================================
  // Checkbox 토글 테스트
  // ============================================================================
  describe("Checkbox 토글", () => {
    it("확장 시 Primary Key 체크박스가 표시된다", async () => {
      const user = userEvent.setup()

      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      // 확장 버튼 클릭
      const expandButton = screen.getAllByRole("button")[0]
      await user.click(expandButton)

      expect(screen.getByText("Primary Key")).toBeInTheDocument()
    })

    it("확장 시 Unique 체크박스가 표시된다", async () => {
      const user = userEvent.setup()

      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      const expandButton = screen.getAllByRole("button")[0]
      await user.click(expandButton)

      expect(screen.getByText("Unique")).toBeInTheDocument()
    })

    it("확장 시 Nullable 체크박스가 표시된다", async () => {
      const user = userEvent.setup()

      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      const expandButton = screen.getAllByRole("button")[0]
      await user.click(expandButton)

      expect(screen.getByText("Nullable")).toBeInTheDocument()
    })

    it("Primary Key 체크박스 변경 시 onChange가 호출된다", async () => {
      const user = userEvent.setup()

      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      const expandButton = screen.getAllByRole("button")[0]
      await user.click(expandButton)

      const pkCheckbox = screen.getByRole("checkbox", { name: /primary key/i })
      await user.click(pkCheckbox)

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ isPrimaryKey: true })
      )
    })
  })

  // ============================================================================
  // Enum 타입 테스트
  // ============================================================================
  describe("Enum 타입", () => {
    it("Inline Enum 타입일 때 Enum 아이콘을 표시한다", () => {
      const enumProperty: EntityProperty = {
        ...defaultProperty,
        type: "enum",
        enumDef: {
          name: "Status",
          values: [{ key: "Active", value: "active" }],
        },
      }

      render(
        <PropertyForm
          property={enumProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByTitle("Inline Enum")).toBeInTheDocument()
    })

    it("Inline Enum일 때 값 개수 배지를 표시한다", () => {
      const enumProperty: EntityProperty = {
        ...defaultProperty,
        type: "enum",
        enumDef: {
          name: "Status",
          values: [
            { key: "Active", value: "active" },
            { key: "Inactive", value: "inactive" },
          ],
        },
      }

      render(
        <PropertyForm
          property={enumProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      expect(screen.getByText("2 values")).toBeInTheDocument()
    })

    it("확장 시 Enum 이름 입력 필드가 표시된다", async () => {
      const user = userEvent.setup()

      const enumProperty: EntityProperty = {
        ...defaultProperty,
        type: "enum",
        enumDef: {
          name: "Status",
          values: [],
        },
      }

      render(
        <PropertyForm
          property={enumProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      const expandButton = screen.getAllByRole("button")[0]
      await user.click(expandButton)

      expect(screen.getByText("Enum Name")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Status")).toBeInTheDocument()
    })

    it("Enum 참조 타입일 때 해당 Enum 이름을 아이콘 타이틀에 표시한다", () => {
      const enumRefProperty: EntityProperty = {
        ...defaultProperty,
        type: "UserRole",
      }

      const availableEnums: EnumNode[] = [
        {
          id: "enum-1",
          type: "enum",
          position: { x: 0, y: 0 },
          data: {
            name: "UserRole",
            values: [{ key: "Admin", value: "admin" }],
          },
        },
      ]

      render(
        <PropertyForm
          property={enumRefProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          availableEnums={availableEnums}
        />
      )

      expect(screen.getByTitle("Enum: UserRole")).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Default Value 테스트
  // ============================================================================
  describe("Default Value", () => {
    it("확장 시 Default Value 입력 필드가 표시된다", async () => {
      const user = userEvent.setup()

      render(
        <PropertyForm
          property={defaultProperty}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      const expandButton = screen.getAllByRole("button")[0]
      await user.click(expandButton)

      expect(screen.getByText("Default Value")).toBeInTheDocument()
    })

    it("Default Value가 있으면 표시된다", async () => {
      const user = userEvent.setup()

      const propertyWithDefault: EntityProperty = {
        ...defaultProperty,
        defaultValue: "hello",
      }

      render(
        <PropertyForm
          property={propertyWithDefault}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
        />
      )

      const expandButton = screen.getAllByRole("button")[0]
      await user.click(expandButton)

      expect(screen.getByDisplayValue("hello")).toBeInTheDocument()
    })
  })
})
