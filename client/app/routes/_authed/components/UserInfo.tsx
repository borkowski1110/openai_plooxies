import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { logoutFn } from "@/routes/logout";

export type UserInfoData = {
  email: string;
  imageUrl?: string;
};

export const UserInfo = ({ email, imageUrl }: UserInfoData) => {
  const logout = useServerFn(logoutFn);

  const commonInfo = (
    <>
      <Avatar className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        <AvatarImage src={imageUrl} alt={email} />
        <AvatarFallback className="rounded-none uppercase">{email[0]}</AvatarFallback>
      </Avatar>
      <div className="text-sidebar-foreground grid flex-1 text-left">
        <span className="truncate text-xs leading-tight">{email}</span>
      </div>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {commonInfo}
              <ChevronDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[calc(5px*2+var(--radix-dropdown-menu-trigger-width))] min-w-56 -translate-x-[5px] translate-y-[calc(-5px+-1*var(--radix-dropdown-menu-trigger-height))] rounded-lg"
            align="start"
            side="bottom"
            sideOffset={0}
            alignOffset={0}
            avoidCollisions={false}
          >
            <div className="flex h-12 w-full items-center gap-2 p-2">{commonInfo}</div>
            <DropdownMenuSeparator className="bg-muted" />
            <DropdownMenuItem onSelect={() => logout()}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
