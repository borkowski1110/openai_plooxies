import React from "react";
import { View, Text, StyleSheet, Platform, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Hotel } from "@/data/database";

export default function HotelScreen() {
  const { name, description, gallery } = useLocalSearchParams<
    Pick<Hotel, "name" | "description"> & { gallery: string }
  >();

  const parsedGallery = gallery.split(",");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{name}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>{description}</Text>
      </View>
      <View style={styles.gallery}>
        {parsedGallery.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={styles.galleryImage}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 44 : 16,
    paddingBottom: 16,
    backgroundColor: "#A1CEDC",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  placeholder: {
    fontSize: 16,
    color: "#666",
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryImage: {
    width: 100,
    height: 100,
    margin: 5,
  },
});
