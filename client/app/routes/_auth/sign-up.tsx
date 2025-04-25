import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-select";
import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TEXT_BULLET } from "./components/const";
import { signupFn } from "./mutations/sign-up";

const SignUpFormSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password is too short")
    .refine(
      (value) => {
        const hasLowerCase = /[a-z]/.test(value);
        const hasUpperCase = /[A-Z]/.test(value);
        const hasNumbers = /[0-9]/.test(value);
        const hasSpecialCharacters = /[^a-zA-Z0-9]/.test(value);
        return (
          (hasLowerCase ? 1 : 0) + (hasUpperCase ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSpecialCharacters ? 1 : 0) >= 3
        );
      },
      {
        message:
          "Password must contain at least 3 of the following 4 types of characters: lower case letters, upper case letters, numbers, special characters",
      },
    ),
});

export const Route = createFileRoute("/_auth/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  const initialEmail = useLocation({ select: ({ state }) => state.email });
  const form = useForm({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: initialEmail ?? "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const handleSignup = useServerFn(signupFn);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-card-foreground text-3xl font-bold">Create an account</span>
        <span className="text-muted-foreground text-sm font-normal">Join us and unlock unlimited possibilities</span>
      </div>
      <Form
        form={form}
        onSubmit={form.handleSubmit(async ({ email, password }) => {
          try {
            await handleSignup({
              data: {
                email,
                password,
              },
            });
          } catch (e) {
            console.error(e);
            form.setError("root", {
              type: "manual",
              message: "Oops! Something went wrong on our end. Please try again later.",
            });
          }
        })}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input autoComplete="email" placeholder="john@smith.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input autoComplete="new-password" placeholder={TEXT_BULLET.repeat(8)} type="password" {...field} />
                </FormControl>
                <FormDescription>Minimum 8 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {form.formState.errors.root && (
          <div className="text-destructive text-xs font-medium">{form.formState.errors.root.message}</div>
        )}
        <Button type="submit" isLoading={form.formState.isSubmitting}>
          Submit
        </Button>
      </Form>
      <div className="relative">
        <Separator />
        <span className="text-muted-foreground bg-background absolute top-1/2 left-1/2 -translate-1/2 px-2 text-xs">
          OR
        </span>
      </div>
      <span className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link to="/sign-in" state={{ email: form.getValues("email") }} className="text-primary text-sm underline">
          Sign in
        </Link>
      </span>
    </div>
  );
}
