import { Link } from "@tanstack/react-router";
import { HotelCard, HotelCardProps } from "./HotelCard";

export type HotelsListProps = {
  hotels: HotelCardProps[];
};

export function HotelsList({ hotels }: HotelsListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {hotels.map((hotel, index) => (
        <Link
          key={index}
          to="/$hotelId"
          params={{ hotelId: hotel.name.toLowerCase().replace(/\s+/g, "-") }}
          className="focus-visible:ring-primary/20 block h-full rounded-xl focus:outline-none focus-visible:ring"
        >
          <HotelCard {...hotel} />
        </Link>
      ))}
    </div>
  );
}
