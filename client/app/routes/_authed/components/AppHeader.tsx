import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const AppHeader = ({
  breadcrumbs,
  right,
  spanToEnd = false,
}: {
  breadcrumbs: React.ReactNode;
  right?: React.ReactNode;
  spanToEnd?: boolean;
}) => (
  <header className="bg-background z-header sticky top-0 grid h-14 shrink-0 grid-cols-[1fr_minmax(auto,var(--container-main))_1fr] items-center gap-2 border-b px-4">
    <div className="flex items-center gap-2">
      <div className="@container mr-2 flex-grow">
        <Separator
          orientation="vertical"
          className="transition-opacity data-[orientation=vertical]:h-4 @[1px]:opacity-0"
        />
      </div>
    </div>
    <div className={cn("flex items-center justify-between", spanToEnd && "col-span-2")}>
      <div className="max-w-main flex flex-grow">{breadcrumbs}</div>
      <div className="ml-auto flex items-center gap-2">{right}</div>
    </div>
  </header>
);
