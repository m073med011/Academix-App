"use client"
"use client"

import { Check, X } from "lucide-react"

import type { DictionaryType } from "@/lib/get-dictionary"

import { cn } from "@/lib/utils"

interface PasswordRequirementsProps {
  password?: string
  isVisible?: boolean
  dictionary: DictionaryType
}

export function PasswordRequirements({
  password = "",
  isVisible = false,
  dictionary,
}: PasswordRequirementsProps) {
  const requirements = [
    {
      id: "length",
      label: dictionary.auth.passwordRequirements.length,
      isValid: password.length >= 8,
    },
    {
      id: "lowercase",
      label: dictionary.auth.passwordRequirements.lowercase,
      isValid: /[a-z]/.test(password),
    },
    {
      id: "uppercase",
      label: dictionary.auth.passwordRequirements.uppercase,
      isValid: /[A-Z]/.test(password),
    },
    {
      id: "number",
      label: dictionary.auth.passwordRequirements.number,
      isValid: /\d/.test(password),
    },
    {
      id: "special",
      label: dictionary.auth.passwordRequirements.special,
      isValid: /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(password),
    },
  ]

  const allValid = requirements.every((req) => req.isValid)

  // Hide if not visible (not focused) OR if all requirements are met
  const shouldShow = isVisible && !allValid

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        shouldShow ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div className="mt-2 space-y-2 rounded-md border bg-muted/50 p-3 text-sm">
        <p className="font-medium text-muted-foreground">
          {dictionary.auth.passwordRequirements.title}
        </p>
        <ul className="space-y-1">
          {requirements.map((req) => (
            <li
              key={req.id}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors duration-200",
                req.isValid ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {req.isValid ? (
                <Check className="h-3 w-3 animate-in zoom-in duration-200" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {req.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
