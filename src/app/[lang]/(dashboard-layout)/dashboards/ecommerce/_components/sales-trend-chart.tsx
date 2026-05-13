"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import type { ComponentProps } from "react"
import type { SalesTrendType } from "../types"

import {
  camelCaseToTitleCase,
  formatCurrency,
  formatDateShort,
} from "@/lib/utils"

import { useIsRtl } from "@/hooks/use-is-rtl"
import { useRadius } from "@/hooks/use-radius"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

function ModifiedChartTooltipContent(
  props: ComponentProps<typeof ChartTooltipContent>
) {
  const propsWithPayload = props as any
  if (!propsWithPayload.payload || propsWithPayload.payload.length === 0) return null

  const modifiedProps = {
    ...props,
    payload: propsWithPayload.payload.map((item: any) => ({
      ...item,
      name: camelCaseToTitleCase(String(item.name)),
      value: formatCurrency(Number(item.value)),
    })),
  }

  return <ChartTooltipContent {...(modifiedProps as any)} />
}

export function SalesTrendChart({
  data,
}: {
  data: SalesTrendType["salesTrends"]
}) {
  const isRtl = useIsRtl()
  const radius = useRadius()

  return (
    <ChartContainer config={{}} className="aspect-auto h-full w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <ChartTooltip
          cursor={false}
          content={<ModifiedChartTooltipContent hideIndicator hideLabel />}
        />
        <XAxis
          reversed={isRtl}
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value) => formatDateShort(value)}
        />
        <Bar dataKey="sales" fill="var(--chart-4)" radius={radius} />
      </BarChart>
    </ChartContainer>
  )
}
