"use client"

import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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

export function BounceRateChart({
  data,
}: {
  data: OverviewType["bounceRate"]["perMonth"]
}) {
  const isRtl = useIsRtl()

  return (
    <ChartContainer
      config={chartConfig}
      className="h-32 w-full rounded-b-md overflow-hidden"
    >
      <LineChart
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
        <Line
          dataKey="value"
          type="linear"
          stroke="var(--chart-3)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
