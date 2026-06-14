"use client"

import type { DictionaryType } from "@/lib/get-dictionary"

import { typography } from "@/lib/typography"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ActivityProps {
  dictionary: DictionaryType
}

export function Activity({ dictionary }: ActivityProps) {
  const t = dictionary.profilePage.activity

  const activities = [
    {
      id: 1,
      type: "course_completed",
      typeLabel: "Completed",
      title: "UI/UX Design Principles",
      time: t.hoursAgo.replace("{count}", "2"),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
      badgeVariant: "default" as const,
    },
    {
      id: 2,
      type: "course_enrolled",
      typeLabel: "Enrolled",
      title: "Advanced TypeScript Patterns",
      time: t.dayAgo,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
      badgeVariant: "secondary" as const,
    },
    {
      id: 3,
      type: "course_published",
      typeLabel: "Published",
      title: "Software Development Lifecycle",
      time: t.daysAgo.replace("{count}", "3"),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
      badgeVariant: "default" as const,
    },
    {
      id: 4,
      type: "achievement",
      typeLabel: "Achievement",
      title: "Master Instructor badge",
      time: t.weekAgo,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
      badgeVariant: "outline" as const,
    },
    {
      id: 5,
      type: "milestone",
      typeLabel: "Milestone",
      title: "5,000 total students",
      time: t.weeksAgo.replace("{count}", "2"),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
      badgeVariant: "outline" as const,
    },
  ]

  return (
    <div className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id}>
                <div className="flex items-start gap-4">
                  <Avatar className="size-10">
                    <AvatarImage src={activity.avatar} alt="Activity icon" />
                    <AvatarFallback>{activity.id}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={activity.badgeVariant}>
                        {activity.typeLabel}
                      </Badge>
                      <span className={typography.muted}>{activity.time}</span>
                    </div>
                    <p className={typography.large}>{activity.title}</p>
                  </div>
                </div>
                {index < activities.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
