import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { loginMutationOptions } from "@/routes/mutations/log-in";
import { signUpMutationOptions } from "../routes/mutations/sign-up";
import { Auth } from "./Auth";

export function Login() {
  const router = useRouter();

  const loginMutation = useMutation({
    ...loginMutationOptions,
    onSuccess: async (data) => {
      if (!data?.error) {
        await router.invalidate();
        await router.navigate({ to: "/" });
        return;
      }
    },
  });

  const signupMutation = useMutation(signUpMutationOptions);

  return (
    <Auth
      actionText="Login"
      status={loginMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement);

        loginMutation.mutate({
          data: {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
          },
        });
      }}
      afterSubmit={
        loginMutation.data ? (
          <>
            <div className="text-red-400">{loginMutation.data.message}</div>
            {loginMutation.data.error && loginMutation.data.message === "Invalid login credentials" ? (
              <div>
                <button
                  className="text-blue-500"
                  onClick={(e) => {
                    const form = (e.target as HTMLButtonElement).form;
                    if (!form) {
                      throw new Error("Form should be defined");
                    }

                    const formData = new FormData();

                    signupMutation.mutate({
                      data: {
                        email: formData.get("email") as string,
                        password: formData.get("password") as string,
                      },
                    });
                  }}
                  type="button"
                >
                  Sign up instead?
                </button>
              </div>
            ) : null}
          </>
        ) : null
      }
    />
  );
}
