import { z } from "zod";

export const SettingSchema = z.object({
  site_name: z.string().min(5, "Site name must be at least 5 characters."),
  site_description: z.string().min(10, "Description must be at least 10 characters."),
  contact_email: z.email("Invalid email address."),
  facebook_url: z.string().url("Invalid URL.").optional(),
  instagram_url: z.string().url("Invalid URL.").optional(),
  youtube_url: z.string().url("Invalid URL.").optional(),
  maintenace_mode: z.boolean(), 
  enable_analytics: z.boolean(),
  cookie_consent: z.boolean(),
});

export type SettingForm = z.infer<typeof SettingSchema>;