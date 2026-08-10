import { z } from "astro/zod";

export const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  email: z.string().email("Please provide a valid email address."),
  message: z.string().min(5, "Message must be at least 5 characters").max(500),
});
export type FormSchema = z.infer<typeof formSchema>;
