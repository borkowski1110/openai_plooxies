import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-select";
import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TEXT_BULLET } from "./components/const";
import { loginFn } from "./mutations/log-in";

const SignInFormSchema = z.object({
  email: z.string().trim().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const Route = createFileRoute("/_auth/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const initialEmail = useLocation({ select: ({ state }) => state.email });

  const handleLogin = useServerFn(loginFn);

  const form = useForm({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: { email: initialEmail ?? "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const redirectTo = search.redirect ?? "/";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-card-foreground text-3xl font-bold">Sign in</span>
        <span className="text-muted-foreground text-sm font-normal">
          Welcome back! We&apos;re excited to see you again
        </span>
      </div>
      <Form
        form={form}
        onSubmit={form.handleSubmit(async ({ email, password }) => {
          try {
            await handleLogin({
              data: { email, password },
            });
            await navigate({
              href: redirectTo,
              reloadDocument: true,
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
                  <Input autoFocus autoComplete="email" placeholder="john@smith.com" {...field} />
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
                <FormLabel className="flex justify-between gap-1">
                  <span>Password</span>
                </FormLabel>
                <FormControl>
                  <Input
                    autoComplete="current-password"
                    placeholder={TEXT_BULLET.repeat(8)}
                    type="password"
                    {...field}
                  />
                </FormControl>
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
        Don&rsquo;t have an account?{" "}
        <Link to="/sign-up" state={{ email: form.getValues("email") }} className="text-primary text-sm underline">
          Sign up
        </Link>
      </span>
    </div>
  );
}
