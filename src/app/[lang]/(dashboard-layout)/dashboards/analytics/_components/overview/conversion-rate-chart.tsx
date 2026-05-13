"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import type { ComponentProps } from "react"
import type { OverviewType } from "../../types"

import { formatPercent } from "@/lib/utils"

import { useIsRtl } from "@/hooks/use-is-rtl"
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
      value: formatPercent(Number(item.value)),
    })),
  }

  return <ChartTooltipContent {...(modifiedProps as any)} />
}

const chartConfig = {
  value: {
    label: "Rate",
  },
} satisfies ChartConfig

export function ConversionRateChart({
  data,
}: {
  data: OverviewType["conversionRate"]["perMonth"]
}) {
  const isRtl = useIsRtl()

  return (
    <ChartContainer
      config={chartConfig}
      className="h-32 w-full rounded-b-md overflow-hidden"
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 0,
          right: 0,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis reversed={isRtl} dataKey="month" hide />
        <ChartTooltip
          cursor={false}
          content={<ModifiedChartTooltipContent />}
        />
        <Area
          dataKey="value"
          type="step"
          fill="var(--chart-4)"
          stroke="var(--chart-4)"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
