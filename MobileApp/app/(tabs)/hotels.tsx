import { StyleSheet, Image, Platform } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useEffect, useMemo, useState } from "react";
import { getHotels, Hotel } from "@/data/database";
import { Avatar, List, ListItem } from "@ui-kitten/components";
import { router } from "expo-router";

const AvatarComponent = ({ item }: { item: Hotel }) => {
  return item.avatar ? <Avatar source={{ uri: item.avatar }} /> : null;
};

const isArrayOfStrings = (value: any): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
};

export default function HotelsScreen() {
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    getHotels().then((hotels) => {
      if (hotels) setHotels(hotels);
    });
  }, []);

  const renderItem = useMemo(() => {
    return ({ item }: { item: Hotel }) => (
      <ListItem
        onPress={() => {
          router.push({
            pathname: "/hotel",
            params: {
              name: item.name,
              description: item.description,
              gallery: isArrayOfStrings(item.gallery) ? item.gallery : [],
            },
          });
        }}
        title={item.name}
        description={item.description}
        accessoryLeft={<AvatarComponent item={item} />}
      />
    );
  }, []);

  return (
    <List
      data={hotels}
      renderItem={renderItem}
      ListHeaderComponent={
        <Image
          source={require("@/assets/images/header-hotels.jpg")}
          style={{
            width: "100%",
            height: 300,
            transform: [{ translateY: -20 }],
          }}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
