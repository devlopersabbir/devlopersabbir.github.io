import axios from "axios";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { formSchema, type FormSchema } from "../../libs/form-validation";
import { toast } from "sonner";

const HireMeForm = () => {
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<FormSchema>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({}); // Clear previous errors

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData) as FormSchema;

    const parsed = formSchema.safeParse(data);

    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      parsed.error.errors.forEach((err) => {
        const fieldName = err.path[0] as keyof FormSchema;
        fieldErrors[fieldName] = err.message;
      });
      setErrors(fieldErrors);
      return toast.error("Please fix the form errors.");
    }

    startTransition(async () => {
      try {
        await axios.post("/api/send-email", parsed.data);
        toast.success("Your message has been sent successfully!");
        event.currentTarget.reset();
        formRef.current?.reset();
      } catch (err: any) {
        toast.error("Failed to send the message. Please try again.");
      }
    });
  };

  return (
    <div className="flex-1 bg-zinc-900 p-8 rounded-lg shadow-xl max-h-[700px] overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-400">
        Let's Work Together
      </h1>
      <p className="text-zinc-300 mb-6 text-center text-sm">
        I'm currently available for freelance or full-time remote work. Fill out
        the form and I'll get back to you shortly.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit} ref={formRef}>
        <div>
          <label htmlFor="name" className="block text-sm mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-2 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-2 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full px-4 py-2 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Tell me about your project..."
          ></textarea>
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded bg-blue-500 hover:bg-blue-400 transition-colors text-white font-semibold cursor-pointer disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default HireMeForm;
