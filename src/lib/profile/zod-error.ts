import { ZodError } from "zod";

import { strings } from "@/lib/strings";

export function firstZodMessage(error: ZodError): string {
  return error.issues[0]?.message ?? strings.common.errorGeneric;
}
