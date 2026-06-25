// @ts-check

import { z } from "zod";

export const supportNoteSchema = z.object({
  note: z.string().trim().min(3, "Support note must be at least 3 characters."),
});
