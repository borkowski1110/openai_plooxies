import {
  Image,
  StyleSheet,
  Platform,
  FlatList,
  View,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { List, ListItem, Text } from "@ui-kitten/components";

interface Message {
  id: string;
  title: string;
  description: string;
  date: string;
  route: "/chat";
}

const Date = ({ date }: { date: string }) => (
  <View style={styles.dateContainer}>
    <Text style={styles.dateText} appearance="hint" category="c1">
      {date}
    </Text>
  </View>
);

const initialMessages: Message[] = [
  {
    id: "1",
    title: "Chat 1",
    description: "Basic chat interface",
    date: "1:30 PM",
    route: "/chat",
  },
  {
    id: "2",
    title: "Chat 2",
    description: "Basic chat interface",
    date: "2:30 PM",
    route: "/chat",
  },
];

export default function CallsScreen() {
  const router = useRouter();

  const renderItem = useMemo(() => {
    return ({ item }: { item: Message }) => (
      <ListItem
        onPress={() => router.push(item.route)}
        title={item.title}
        description={item.description}
        // accessoryLeft={renderProfileAvatar}
        accessoryRight={<Date date={item.date} />}
      />
    );
  }, []);

  return (
    <List
      style={styles.list}
      data={initialMessages}
      renderItem={renderItem}
      ListHeaderComponent={
        <Image
          source={require("@/assets/images/header-calls.jpg")}
          style={styles.reactLogo}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  list: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 300,
    width: "100%",
  },
  listContainer: {
    paddingVertical: 16,
  },
  messageItem: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  messageContent: {
    gap: 4,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  messageDescription: {
    fontSize: 14,
    color: "#666",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    textAlign: "right",
    minWidth: 64,
  },
});
