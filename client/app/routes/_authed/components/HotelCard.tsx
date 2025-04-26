import { StarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type HotelCardProps = {
  name: string;
  description: string;
  rating: number;
  imageUrl?: string;
};

export function HotelCard({ name, description, rating, imageUrl }: HotelCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0">
      <div className="bg-mute aspect-4/3 w-full overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={`${name} view`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Image coming soon</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{description}</p>

        <div className="mt-3 flex items-center">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`size-4 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-500 text-yellow-500"
                    : i < rating
                      ? "fill-yellow-500 text-yellow-500 opacity-50"
                      : "text-muted stroke-muted"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm font-medium">{rating}/5</span>
        </div>
      </div>

      <div className="mt-auto border-t p-4">
        <div className="text-primary flex items-center gap-1 text-sm font-medium group-hover:underline">
          View details
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:translate-x-1"
          >
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
}

export function HotelCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden p-0">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-1/2" />
        <Skeleton className="mt-3 h-4 w-24" />
      </div>
      <div className="border-t p-4">
        <Skeleton className="h-4 w-24" />
      </div>
    </Card>
  );
}
