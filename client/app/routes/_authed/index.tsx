import { createFileRoute } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppHeader } from "./components/AppHeader";
import { PageHeader, PageHeaderInfo, PageHeaderInfoDescription, PageHeaderInfoTitle } from "./components/PageHeader";

export const Route = createFileRoute("/_authed/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col">
      <AppHeader
        breadcrumbs={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbPage>Examples</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Formatting</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <PageHeader>
        <PageHeaderInfo>
          <PageHeaderInfoTitle>Formatting</PageHeaderInfoTitle>
          <PageHeaderInfoDescription>A showcase of typography and layout possibilities</PageHeaderInfoDescription>
        </PageHeaderInfo>
      </PageHeader>
      <div className="flex flex-col items-center p-6">
        <div className="max-w-main flex w-full flex-col">
          <article className="prose mb-12">
            <h2>Showcase of Formatting Possibilities</h2>
            <p>
              This page demonstrates various typography and formatting options available in this template. You can see
              how different elements render and use this as a reference for structuring your own content.
            </p>
            <p>
              The styling system provides consistent spacing, typography, and visual hierarchy that works across all
              device sizes.
            </p>
            <p>Here are some formatting examples you can utilize:</p>
            <ul>
              <li>
                Regular text with <strong>bold emphasis</strong> for important points
              </li>
              <li>
                Lists with <em>italicized text</em> to highlight key concepts
              </li>
              <li>
                Inline code like <code>const example = true;</code> for technical references
              </li>
              <li>Links to external resources with proper styling</li>
              <li>Multiple heading levels to structure your content</li>
            </ul>
            <p>
              The typography system is built on responsive principles, automatically adjusting to different screen sizes
              while maintaining readability and visual harmony throughout the interface.
            </p>
            <div className="h-2" />
            <h3>Content Structure Examples</h3>
            <ul>
              <li>
                <h4 className="mb-1.5">Hierarchical Headings:</h4>
                <p>
                  Proper heading structure (h2, h3, h4) improves content organization, readability, and accessibility.
                  It also helps with SEO and provides clear visual hierarchy.
                </p>
              </li>
              <li>
                <h4 className="mb-1.5">Lists and Paragraphs:</h4>
                <p>
                  Breaking content into well-organized paragraphs and lists makes information easier to scan and digest.
                  This is especially important for technical or complex topics.
                </p>
              </li>
            </ul>
            <div className="h-2" />
            <h3>Code Block Example</h3>
            <p>For displaying code samples, you can use pre/code blocks:</p>
            <pre>
              <code>{`function formatExample() {
  return {
    result: "Properly formatted code",
    indentation: "Preserved",
    syntax: "Highlighted when used with proper plugins"
  };
}`}</code>
            </pre>
            <div className="h-2" />
            <h3>Additional Resources</h3>
            <p>
              <a className="underline" href="https://example.com" target="_blank" rel="noopener noreferrer">
                Example Resource Link
              </a>{" "}
              - Links can be styled with underlines and proper spacing
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
