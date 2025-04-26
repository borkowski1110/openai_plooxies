import { createFileRoute } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppHeader } from "./components/AppHeader";
import { PageHeader, PageHeaderInfo, PageHeaderInfoTitle, PageHeaderInfoDescription } from "./components/PageHeader";

export const Route = createFileRoute("/_authed/$hotelId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { hotelId } = Route.useParams();

  return (
    <div className="flex flex-col">
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
          <PageHeaderInfoDescription>Your hotels dashboard</PageHeaderInfoDescription>
        </PageHeaderInfo>
      </PageHeader>
      <div className="flex flex-col items-center p-6">
        <div className="max-w-main flex w-full flex-col">{hotelId}</div>
      </div>
    </div>
  );
}
