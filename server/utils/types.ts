import { z } from "zod";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const ZodExampleSchema = z.object({
  type: z.string(),
  attrs: z.record(z.string(), z.any()).optional(),
});

export type ZodExampleType = z.infer<typeof ZodExampleSchema>;
