import { z } from "zod";

export const FaqSchema = z.object({
  question: z.string().min(10, "Question must be at least 10 characters."),
  answer: z.string().min(10, "Answer must be at least 10 characters."),
  category: z.enum(["General", "Shipping","Returns","Ethics"]),
  display_order: z.number().nonnegative("Display order must be a non-negative number."),
});

export type FaqForm = z.infer<typeof FaqSchema>;
