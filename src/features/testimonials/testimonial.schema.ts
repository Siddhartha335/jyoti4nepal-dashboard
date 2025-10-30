import { z } from "zod";

export const TestimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  content: z.string().min(10, "Testimonial must be at least 10 characters."),
  rating: z.number().min(1, "Please provide a rating.").max(5),
  featured: z.enum(["Featured", "Normal"]),
  company_logo: z.instanceof(File).optional().or(z.null()),
});

export type TestimonialForm = z.infer<typeof TestimonialSchema>;
