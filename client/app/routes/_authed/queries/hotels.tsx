import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/utils/supabase/server";

type Hotel = {
  avatar: string;
  created_at: string;
  description: string;
  gallery: string[];
  id: number;
  name: string;
  rating: number;
};

const getHotels = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("hotels").select("*");
  return (data ?? []) as Hotel[];
});

export const hotelsQueryOptions = queryOptions({
  queryKey: ["hotels"],
  queryFn: getHotels,
  select: (data) =>
    data.map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      imageUrl: hotel.gallery[0],
      rating: hotel.rating,
    })),
});
