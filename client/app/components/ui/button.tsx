import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Spinner } from "@/components/Spinner";
import { cn } from "@/lib/utils";
import { NestedSlot } from "@/lib/nested-slot";

const buttonLayoutClasses = cn("items-center justify-center gap-2");

const buttonVariants = cva(
  cn(
    "ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 text-foreground inline-flex rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:focus-visible:ring-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    buttonLayoutClasses,
  ),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
        outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground border shadow-xs",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xs",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        inline: "text-primary font-normal underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
    compoundVariants: [
      {
        variant: "inline",
        size: ["default", "sm", "lg", "icon"],
        class: "px-0",
      },
    ],
  },
);

function Button({
  className,
  variant = "default",
  size,
  disabled = false,
  isLoading,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
  }) {
  const shouldLoaderReplaceContent = isLoading && (!variant || !["inline", "link"].includes(variant));

  const modifiedProps = {
    ...props,
    disabled: disabled || isLoading,
  };

  return (
    <NestedSlot
      component="button"
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      childrenWrapper={({ children }) => (
        <div className="relative flex grow gap-1">
          <div
            // TODO: Allow for overrides like "justify-between" on the main button component
            className={cn("flex grow", buttonLayoutClasses, {
              "opacity-0": shouldLoaderReplaceContent,
            })}
          >
            {children}
          </div>
          {isLoading && (
            <Spinner size="small" className={cn(shouldLoaderReplaceContent && "absolute inset-0 m-auto")} />
          )}
        </div>
      )}
      {...modifiedProps}
    />
  );
}

export { Button, buttonVariants };
