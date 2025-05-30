import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppHeader } from "./components/AppHeader";
import { HotelsList } from "./components/HotelsList";
import { PageHeader, PageHeaderInfo, PageHeaderInfoDescription, PageHeaderInfoTitle } from "./components/PageHeader";
import { hotelsQueryOptions } from "./queries/hotels";

export const Route = createFileRoute("/_authed/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: hotels } = useQuery(hotelsQueryOptions);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Admin</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Hotels</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <PageHeader>
        <PageHeaderInfo>
          <PageHeaderInfoTitle>Hotels</PageHeaderInfoTitle>
          <PageHeaderInfoDescription>Manage your properties</PageHeaderInfoDescription>
        </PageHeaderInfo>
      </PageHeader>
      <div className="flex flex-1 flex-col items-center p-6 pb-12">
        <div className="w-full max-w-[1400px]">
          <HotelsList hotels={hotels ?? []} />
        </div>
      </div>
    </div>
  );
}
