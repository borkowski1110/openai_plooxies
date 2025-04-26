import React, { useEffect, useMemo } from "react";
import { Image as RNImage } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  Avatar,
  Button,
  Card,
  Layout,
  Text,
  Icon,
} from "@ui-kitten/components";
import { Hotel } from "@/data/database";

export default function HotelScreen() {
  const { name, avatar, description, gallery, rating } = useLocalSearchParams<
    Pick<Hotel, "name" | "description"> & {
      gallery: string;
      avatar: string;
      rating: string;
    }
  >();

  const navigation = useNavigation();

  useEffect(() => {
    if (name) {
      navigation.setOptions({ title: name });
    }
  }, [name, navigation]);

  // Mocked stats and location
  const location = "Germany";
  const reviews = 1500;
  const following = 86;
  const posts = 116;

  const parsedGallery = useMemo(() => gallery.split(","), [gallery]);

  return (
    <Layout style={{ flex: 1, backgroundColor: "#F7F9FC" }}>
      {/* Profile Card */}
      <Card disabled style={{ margin: 16, borderRadius: 16 }}>
        <Layout style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar
            source={avatar ? { uri: avatar } : undefined}
            size="giant"
            style={{ marginRight: 16 }}
          />
          <Layout style={{ flex: 1 }}>
            <Text category="h6">{name}</Text>
            <Text appearance="hint" style={{ marginTop: 2 }}>
              {location}
            </Text>
          </Layout>
          <Layout
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 20,
              marginBottom: 8,
            }}
          >
            {Array.from({ length: parseInt(rating) })
              .fill(0)
              .map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  fill="#F7B500"
                  style={{ width: 20, height: 20, marginRight: 2 }}
                />
              ))}
            {Array.from({ length: 5 - parseInt(rating) }).map((_, i) => (
              <Icon
                key={i}
                name="star-outline"
                fill="#C5CEE0"
                style={{ width: 20, height: 20 }}
              />
            ))}
          </Layout>
        </Layout>

        <Layout style={{ flexDirection: "row", marginTop: 16 }}>
          <Button
            style={{ flex: 1, marginRight: 8 }}
            status="primary"
            accessoryLeft={<Icon name="phone" />}
            onPress={() => {}}
          >
            CALL
          </Button>
          <Button
            style={{ flex: 1 }}
            appearance="outline"
            accessoryLeft={<Icon name="message-circle-outline" />}
            onPress={() => {}}
          >
            MESSAGE
          </Button>
        </Layout>
      </Card>

      {/* Stats + Description Section */}
      <Card
        disabled
        style={{
          marginHorizontal: 16,
          marginBottom: 8,
          borderRadius: 12,
          padding: 0,
        }}
      >
        <Layout style={{ flexDirection: "row", alignItems: "stretch" }}>
          {/* Stats Column */}
          <Layout
            style={{
              width: 70,
              justifyContent: "center",
              alignItems: "flex-end",
              paddingVertical: 16,
              borderRightWidth: 1,
              borderRightColor: "#EDF1F7",
              paddingRight: 16,
            }}
          >
            <Layout style={{ alignItems: "flex-end", marginBottom: 16 }}>
              <Text category="s1">{reviews}</Text>
              <Text appearance="hint" category="c1">
                Reviews
              </Text>
            </Layout>
            <Layout style={{ alignItems: "flex-end", marginBottom: 16 }}>
              <Text category="s1">{following}</Text>
              <Text appearance="hint" category="c1">
                Following
              </Text>
            </Layout>
            <Layout style={{ alignItems: "flex-end" }}>
              <Text category="s1">{posts}</Text>
              <Text appearance="hint" category="c1">
                Posts
              </Text>
            </Layout>
          </Layout>
          {/* Description Column */}
          <Layout
            style={{
              flex: 1,
              justifyContent: "center",
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
          >
            <Text appearance="hint">{description}</Text>
          </Layout>
        </Layout>
      </Card>

      <Card
        disabled
        style={{
          marginHorizontal: 16,
          margin: 12,
          borderRadius: 12,
          padding: 0,
        }}
      >
        <Layout
          style={{
            flexDirection: "row",
            justifyContent: "center",
            paddingHorizontal: 8,
          }}
        >
          {parsedGallery.map((image, index) => (
            <RNImage
              key={index}
              source={{ uri: image }}
              style={{
                width: 100,
                height: 100,
                margin: 6,
                padding: 0,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          ))}
        </Layout>
      </Card>
    </Layout>
  );
}
