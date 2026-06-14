"use client"

import { useState } from "react"
import { Plus, Trash2, CheckCircle2, Circle, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QuizQuestion } from "@/types/api"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface QuizBuilderProps {
  questions: QuizQuestion[]
  onChange: (questions: QuizQuestion[]) => void
}

export function QuizBuilder({ questions, onChange }: QuizBuilderProps) {
  const addQuestion = () => {
    onChange([
      ...questions,
      {
        text: "",
        options: ["", ""],
        correctAnswer: "",
      },
    ])
  }

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions]
    newQuestions.splice(index, 1)
    onChange(newQuestions)
  }

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions]
    newQuestions[index].text = text
    onChange(newQuestions)
  }

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push("")
    onChange(newQuestions)
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.splice(optionIndex, 1)
    
    // If the removed option was the correct answer, reset correct answer
    const removedOptionText = questions[questionIndex].options[optionIndex]
    if (questions[questionIndex].correctAnswer === removedOptionText) {
      newQuestions[questionIndex].correctAnswer = ""
    }
    
    onChange(newQuestions)
  }

  const updateOptionText = (
    questionIndex: number,
    optionIndex: number,
    text: string
  ) => {
    const newQuestions = [...questions]
    
    // Update correct answer if it matches the old text
    const oldText = newQuestions[questionIndex].options[optionIndex]
    if (newQuestions[questionIndex].correctAnswer === oldText) {
      newQuestions[questionIndex].correctAnswer = text
    }
    
    newQuestions[questionIndex].options[optionIndex] = text
    onChange(newQuestions)
  }

  const setCorrectAnswer = (questionIndex: number, optionText: string) => {
    const newQuestions = [...questions]
    // Toggle: if already selected, deselect (optional, but quiz usually needs one answer)
    // For now, strict select
    newQuestions[questionIndex].correctAnswer = optionText
    onChange(newQuestions)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Quiz Questions ({questions.length})</Label>
        <Button onClick={addQuestion} size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            No questions added yet. Click "Add Question" to start.
          </div>
        )}
        
        {questions.map((question, qIndex) => (
          <Card key={qIndex} className="relative group">
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
                  {qIndex + 1}
                </span>
                <Input
                  value={question.text}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  placeholder="Enter question text..."
                  className="font-medium"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => removeQuestion(qIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 pl-9">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6 shrink-0 rounded-full",
                        question.correctAnswer === option && option !== ""
                          ? "text-green-600 hover:text-green-700 bg-green-50"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => setCorrectAnswer(qIndex, option)}
                      disabled={option === ""}
                      title="Mark as correct answer"
                    >
                      {question.correctAnswer === option && option !== "" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Input
                      value={option}
                      onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className="h-9"
                    />
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeOption(qIndex, oIndex)}
                      disabled={question.options.length <= 2}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addOption(qIndex)}
                  className="text-xs text-muted-foreground hover:text-primary pl-9"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Option
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
