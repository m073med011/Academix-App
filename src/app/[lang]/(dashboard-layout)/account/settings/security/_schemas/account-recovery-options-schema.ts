import { z } from "zod"

export const AccountRecoveryOptionsSchema = z.object({
  option: z.enum(["email", "sms", "codes"], {
    message: "You need to select an account recovery option.",
  }),
})
