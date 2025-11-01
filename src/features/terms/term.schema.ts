import { z } from "zod";

export const TermSchema = z.object({
  title: z.string().min(5, "Question must be at least 5 characters."),
  content: z.string().min(10, "Answer must be at least 10 characters."),
  author: z.string().min(1, "Author is required."),
});

export type TermForm = z.infer<typeof TermSchema>;