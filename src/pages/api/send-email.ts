import type { APIRoute } from "astro";
import { Resend } from "resend";
import type { FormSchema } from "../../libs/form-validation";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ params, request }) => {
  const { name, email, message } = (await request.json()) as FormSchema;

  const send = await resend.emails.send({
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

  if (send.data) {
    return new Response("Mail send successfully");
  } else {
    throw new Error("Fail to send mail");
  }
};
