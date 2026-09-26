import { z } from "zod";

import { strings } from "@/lib/strings";

let registered = false;

/** Registers a Russian fallback for Zod invalid_type / too_small / too_big. */
export function registerRussianZodMap(): void {
  if (registered) return;
  registered = true;
  z.config({
    customError: (issue) => {
      switch (issue.code) {
        case "invalid_type":
          return strings.profile.errors.invalidType;
        case "too_small":
          return strings.profile.errors.tooSmall;
        case "too_big":
          return strings.profile.errors.tooBig;
        case "invalid_value":
          return strings.profile.errors.invalidType;
        default:
          return undefined;
      }
    },
  });
}

registerRussianZodMap();
