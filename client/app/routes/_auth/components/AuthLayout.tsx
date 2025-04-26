import { ReactNode } from "react";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="@container flex h-full w-full gap-3 justify-self-center overflow-auto p-3 *:flex-1">
      <div className="flex h-full flex-col pt-15">
        <div className="flex w-full max-w-[360px] flex-grow flex-col justify-center self-center pb-15">{children}</div>
      </div>
    </div>
  );
};
