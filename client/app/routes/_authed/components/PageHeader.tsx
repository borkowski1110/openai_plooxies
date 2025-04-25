import { ReactNode } from "react";

export const PageHeader = ({ children }: { children: ReactNode }) => (
  <div className="bg-background flex justify-center border-b p-6">
    <div className="max-w-main flex w-full flex-wrap items-center justify-between gap-4 sm:flex-nowrap">{children}</div>
  </div>
);

export const PageHeaderInfo = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-2">{children}</div>
);

export const PageHeaderInfoTitle = ({ children }: { children: ReactNode }) => (
  <h1 className="text-foreground text-3xl font-bold">{children}</h1>
);

export const PageHeaderInfoDescription = ({ children }: { children: ReactNode }) => (
  <span className="text-muted-foreground text-base">{children}</span>
);

export const PageHeaderAction = ({ children }: { children: ReactNode }) => (
  <div className="flex grow sm:justify-end">{children}</div>
);
