import { Slot, SlotProps } from "@radix-ui/react-slot";
import { cloneElement, ElementType, isValidElement, ReactElement, ReactNode } from "react";

type NestedSlotProps = SlotProps &
  React.RefAttributes<HTMLElement> & {
    component: ElementType;
    childrenWrapper: ElementType<{ children: ReactNode }>;
    asChild?: boolean;
  };

export function NestedSlot({
  component: Component,
  childrenWrapper: Wrapper,
  asChild,
  children,
  ...rest
}: NestedSlotProps) {
  if (asChild && isValidElement(children)) {
    const element = children as ReactElement<{
      children: ReactNode;
    }>;

    return <Slot {...rest}>{cloneElement(element, element.props, <Wrapper>{element.props.children}</Wrapper>)}</Slot>;
  }

  return (
    <Component {...rest}>
      <Wrapper>{children}</Wrapper>
    </Component>
  );
}
