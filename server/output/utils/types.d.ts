import { z } from "zod";
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare const ZodExampleSchema: z.ZodObject<{
    type: z.ZodString;
    attrs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: string;
    attrs?: Record<string, any> | undefined;
}, {
    type: string;
    attrs?: Record<string, any> | undefined;
}>;
export type ZodExampleType = z.infer<typeof ZodExampleSchema>;
