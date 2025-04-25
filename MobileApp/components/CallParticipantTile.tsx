import { View, StyleSheet, Dimensions } from 'react-native';
import { DailyMediaView } from '@daily-co/react-native-daily-js';
import type { DailyParticipant } from '@daily-co/react-native-daily-js';
import { ThemedText } from './ThemedText';

interface CallParticipantTileProps {
  participant: DailyParticipant;
  isLocal?: boolean;
}

const { width } = Dimensions.get('window');
const TILE_SIZE = width / 2 - 24; // 2 columns with some padding

export function CallParticipantTile({ participant, isLocal }: CallParticipantTileProps) {
  const videoTrack = participant?.tracks?.video?.persistentTrack || null;
  const audioTrack = participant?.tracks?.audio?.persistentTrack || null;

  return (
    <View style={styles.container}>
      <DailyMediaView
        videoTrack={videoTrack}
        audioTrack={audioTrack}
        mirror={isLocal}
        style={styles.video}
        objectFit="cover"
      />
      <View style={styles.overlay}>
        <ThemedText style={styles.participantName}>
          {participant.user_name || 'Participant'} {isLocal ? '(You)' : ''}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2C2C2E',
    margin: 6,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  participantName: {
    color: '#FFFFFF',
    fontSize: 12,
  },
}); 