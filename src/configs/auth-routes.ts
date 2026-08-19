import type { RouteType } from "@/types"

export const routeMap = new Map<string, RouteType>([
  ["/auth", { type: "guest" }],
  ["/sign-in", { type: "guest" }],
  ["/register", { type: "guest" }],
  ["/forgot-password", { type: "guest" }],
  ["/verify-email", { type: "guest" }],
  ["/new-password", { type: "guest" }],
  ["/reactivate-account", { type: "guest" }],
  ["/", { type: "guest" }],
  ["/docs", { type: "public" }],
  ["/public", { type: "public" }],])
