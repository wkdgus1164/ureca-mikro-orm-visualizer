"use client"

/**
 * HITL 질문 프롬프트 컴포넌트
 *
 * AI가 askUser Tool을 호출했을 때 표시되는 질문 UI
 */

import { useState } from "react"
import { HelpCircle, Send, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PendingQuestion } from "@/hooks/use-chat"

interface QuestionPromptProps {
  question: PendingQuestion
  onAnswer: (response: string | string[]) => void
}

/**
 * 질문 프롬프트 컴포넌트
 */
export function QuestionPrompt({ question, onAnswer }: QuestionPromptProps) {
  const [textInput, setTextInput] = useState(question.defaultValue ?? "")
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  // 단일 선택 핸들러
  const handleSingleSelect = (value: string) => {
    onAnswer(value)
  }

  // 다중 선택 토글
  const toggleOption = (value: string) => {
    setSelectedOptions((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    )
  }

  // 다중 선택 제출
  const handleMultipleSubmit = () => {
    if (selectedOptions.length > 0) {
      onAnswer(selectedOptions)
    }
  }

  // 텍스트 입력 제출
  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onAnswer(textInput.trim())
    }
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
      {/* 질문 헤더 */}
      <div className="flex items-start gap-2">
        <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm font-medium">{question.question}</p>
      </div>

      {/* 텍스트 입력 */}
      {question.type === "text" && (
        <div className="space-y-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleTextSubmit()
              }
            }}
            placeholder={question.defaultValue ?? "답변을 입력하세요..."}
            className={cn(
              "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            )}
          />
          <Button
            size="sm"
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="w-full"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            답변 전송
          </Button>
        </div>
      )}

      {/* 단일 선택 */}
      {question.type === "single-choice" && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSingleSelect(option.value)}
              className={cn(
                "w-full text-left rounded-md border p-3 transition-colors",
                "hover:bg-primary/10 hover:border-primary/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              <div className="font-medium text-sm">{option.label}</div>
              {option.description && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 다중 선택 */}
      {question.type === "multiple-choice" && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedOptions.includes(option.value)
            return (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={cn(
                  "w-full text-left rounded-md border p-3 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center",
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
          <Button
            size="sm"
            onClick={handleMultipleSubmit}
            disabled={selectedOptions.length === 0}
            className="w-full mt-2"
          >
            <Check className="h-3.5 w-3.5 mr-1.5" />
            선택 완료 ({selectedOptions.length}개)
          </Button>
        </div>
      )}
    </div>
  )
}
