import { StyleSheet, Image, ActivityIndicator, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { getHotels, Hotel } from "@/data/database";
import { Avatar, List, ListItem } from "@ui-kitten/components";
import { router } from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";

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
  const [loading, setLoading] = useState(true);

  const onRefresh = () => {
    setLoading(true);
    getHotels().then((hotels) => {
      if (hotels) setHotels(hotels);
      setLoading(false);
    });
  };
  useEffect(() => {
    onRefresh();
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

  return loading ? (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Image
          source={require("@/assets/images/header-hotels.jpg")}
          style={{
            width: "100%",
            height: 300,
            transform: [{ translateY: -20 }],
          }}
        />
      }
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#888" />
      </View>
    </ParallaxScrollView>
  ) : (
    <List
      refreshing={loading}
      onRefresh={onRefresh}
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
