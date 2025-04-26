import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from "react-native";
import Daily, {
  DailyParticipant,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
  DailyCall,
} from "@daily-co/react-native-daily-js";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { CallParticipantTile } from "../components/CallParticipantTile";
import { ThemedView } from "../components/ThemedView";
import { Icon, Text } from "@ui-kitten/components";
import { useFocusEffect, useRouter } from "expo-router";

const apiUrl = "https://plooxies-hackathon-openai.loca.lt";

type RoomResponse = {
  url: string;
};
const fetchRoom = async (): Promise<RoomResponse> => {
  const response = await fetch(`${apiUrl}/call`, { method: "POST" });
  const data = (await response.json()) as RoomResponse;
  return data;
};

const userName = "User";

function CallScreen() {
  const router = useRouter();
  const call = useRef<DailyCall | undefined>();
  const [isInCall, setIsInCall] = useState(false);
  const [participants, setParticipants] = useState<
    Record<string, DailyParticipant>
  >({});
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);

  const onViewFocus = useCallback(() => {
    console.log("Navigated to /call route!");
    call.current = Daily.createCallObject();
    const joinCall = async () => {
      const data = await fetchRoom();

      console.log(data);
      await call.current?.join({ url: data.url, userName });
      setIsInCall(true);
      updateParticipants();
    };
    joinCall()
      .then(() => {
        console.log("Joined call");
      })
      .catch((err) => {
        console.error(err);
        if (Platform.OS === "android") {
          ToastAndroid.show("Failed to join call", ToastAndroid.LONG);
        }
        router.back();
      });
  }, []);

  useFocusEffect(onViewFocus);

  const updateParticipants = useCallback(() => {
    setParticipants(call.current?.participants() ?? {});
  }, []);

  const handleParticipantJoined = useCallback(
    (event: DailyEventObjectParticipant) => {
      updateParticipants();
    },
    [updateParticipants]
  );

  const handleParticipantLeft = useCallback(
    (event: DailyEventObjectParticipantLeft) => {
      updateParticipants();
    },
    [updateParticipants]
  );

  useEffect(() => {
    call.current
      ?.on("participant-joined", handleParticipantJoined)
      .on("participant-left", handleParticipantLeft);

    return () => {
      console.log("destroying call");
      call.current?.destroy().then(() => {
        call.current = undefined;
      });
    };
  }, [handleParticipantJoined, handleParticipantLeft]);

  const handleLeaveCall = async () => {
    try {
      await call.current?.leave();
      setIsInCall(false);
      setParticipants({});
      router.back();
    } catch (error) {
      console.error("Failed to leave call:", error);
    }
  };

  const toggleAudio = useCallback(async () => {
    try {
      await call.current?.setLocalAudio(!isAudioOn);
      setIsAudioOn((prev) => !prev);
    } catch (error) {
      console.error("Failed to toggle audio:", error);
    }
  }, [setIsAudioOn]);

  const toggleVideo = useCallback(async () => {
    try {
      await call.current?.setLocalVideo(!isVideoOn);
      setIsVideoOn((prev) => !prev);
    } catch (error) {
      console.error("Failed to toggle video:", error);
    }
  }, [setIsVideoOn]);

  const participantArray = useMemo(
    () => Object.values(participants),
    [participants]
  );

  if (!isInCall) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.joinText}>Joining call...</Text>
        <ActivityIndicator size="large" color="#fff" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.grid}>
        {participantArray.map((participant) => (
          <CallParticipantTile
            key={participant.session_id}
            participant={participant}
            isLocal={participant.local}
          />
        ))}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, !isAudioOn && styles.controlButtonOff]}
          onPress={toggleAudio}
        >
          <Icon
            name={isAudioOn ? "mic-outline" : "mic-off-outline"}
            fill="#FFFFFF"
            style={{
              width: 24,
              height: 24,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, !isVideoOn && styles.controlButtonOff]}
          onPress={toggleVideo}
        >
          <Icon
            name={isVideoOn ? "video-outline" : "video-off-outline"}
            fill="#FFFFFF"
            style={{
              width: 24,
              height: 24,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.endCallButton]}
          onPress={handleLeaveCall}
        >
          <Icon
            name="phone-off-outline"
            fill="#FFFFFF"
            style={{
              width: 24,
              height: 24,
            }}
          />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 48,
    gap: 16,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonOff: {
    backgroundColor: "#FF3B30",
  },
  endCallButton: {
    backgroundColor: "#FF3B30",
  },
  joinButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: "#007AFF",
    borderRadius: 12,
  },
  joinText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
});

export default CallScreen;
