import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { AuthLayout } from "./components/AuthLayout";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.user) {
      if (search.redirect) {
        throw redirect({ href: search.redirect, replace: true });
      }
      throw redirect({ to: "/", replace: true });
    }
  },
});

function RouteComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
}
