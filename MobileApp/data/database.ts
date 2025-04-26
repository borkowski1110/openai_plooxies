import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "./database.types";

const supabase = createClient<Database>(
  "https://nvpvbuzvnimxjkndecjf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cHZidXp2bmlteGprbmRlY2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDI2ODAsImV4cCI6MjA2MTE3ODY4MH0.gJjKm9jW9YcqcvUkOth6Z8Z4YFUfS3e_2_gNbCqXrqU",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

type UnPromiReturnType<T> = T extends () => Promise<infer U> ? U : T;
type NotNull<T> = T extends null ? never : T;

export const getHotels = async () => {
  const { data, error } = await supabase.from("hotels").select("*");
  if (error) {
    console.error(error);
  }
  return data;
};

export type Hotel = NotNull<UnPromiReturnType<typeof getHotels>>[number];
