export const prerender = false;

import { ActionError, defineAction } from "astro:actions";
import { Resend } from "resend";
import { formSchema, type FormSchema } from "../libs/form-validation";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const sendHandler = async ({ name, email, message }: FormSchema) => {
  try {
    const { error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["delivered@resend.dev"],
      subject: `New Contact Form Message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send email. Please try again later.",
      });
    }

    return {
      success: true,
      message: "Your message has been sent successfully!",
    };
  } catch (err) {
    if (err instanceof ActionError) {
      throw err;
    }
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please try again.",
    });
  }
};

export const server = {
  sendMail: defineAction({
    accept: "form",
    input: formSchema,
    handler: sendHandler,
  }),
};
