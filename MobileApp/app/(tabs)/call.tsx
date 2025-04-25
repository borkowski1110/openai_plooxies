import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Daily, {
    DailyEvent,
    DailyParticipant,
    DailyEventObjectParticipant,
    DailyEventObjectParticipantLeft,
    DailyCall
} from '@daily-co/react-native-daily-js';
import { useEffect, useState, useCallback } from 'react';
import { CallParticipantTile } from '@/components/CallParticipantTile';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const call: DailyCall = Daily.createCallObject();

const testURL = 'https://tooploox-hackathon.daily.co/test_room';
const userName = Platform.OS === 'ios' ? 'ios' : 'android';

function CallScreen() {
    const [isInCall, setIsInCall] = useState(false);
    const [participants, setParticipants] = useState<Record<string, DailyParticipant>>({});
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(false);

    const updateParticipants = useCallback(() => {
        setParticipants(call.participants());
    }, []);

    const handleParticipantJoined = useCallback((event: DailyEventObjectParticipant) => {
        console.log('Participant joined:', event);
        updateParticipants();
    }, [updateParticipants]);

    const handleParticipantUpdated = useCallback((event: DailyEventObjectParticipant) => {
        console.log('Participant updated:', event);
        updateParticipants();
    }, [updateParticipants]);

    const handleParticipantLeft = useCallback((event: DailyEventObjectParticipantLeft) => {
        console.log('Participant left:', event);
        updateParticipants();
    }, [updateParticipants]);

    useEffect(() => {
        // Set up event handlers
        call.on('participant-joined', handleParticipantJoined)
            .on('participant-updated', handleParticipantUpdated)
            .on('participant-left', handleParticipantLeft);

        // Clean up the call object when component unmounts
        return () => {
            console.log('destroying call');
            call.destroy();
        };
    }, [handleParticipantJoined, handleParticipantUpdated, handleParticipantLeft]);

    const handleJoinCall = async () => {
        try {
            console.log('Joining call...');
            await call.join({ url: testURL, userName });
            setIsInCall(true);
            updateParticipants();
        } catch (error) {
            console.error('Failed to join call:', error);
        }
    };

    const handleLeaveCall = async () => {
        try {
            await call.leave();
            setIsInCall(false);
            setParticipants({});
        } catch (error) {
            console.error('Failed to leave call:', error);
        }
    };

    const toggleAudio = async () => {
        try {
            await call.setLocalAudio(!isAudioOn);
            setIsAudioOn(!isAudioOn);
        } catch (error) {
            console.error('Failed to toggle audio:', error);
        }
    };

    const toggleVideo = async () => {
        try {
            await call.setLocalVideo(!isVideoOn);
            setIsVideoOn(!isVideoOn);
        } catch (error) {
            console.error('Failed to toggle video:', error);
        }
    };

    if (!isInCall) {
        return (
            <ThemedView style={styles.container}>
                <TouchableOpacity
                    style={styles.joinButton}
                    onPress={handleJoinCall}>
                    <ThemedText style={styles.joinButtonText}>Join Call</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    const participantArray = Object.values(participants);

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
                    onPress={toggleAudio}>
                    <IconSymbol
                        name={isAudioOn ? "mic.fill" : "mic.slash.fill"}
                        size={24}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.controlButton, !isVideoOn && styles.controlButtonOff]}
                    onPress={toggleVideo}>
                    <IconSymbol
                        name={isVideoOn ? "video.fill" : "video.slash.fill"}
                        size={24}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.controlButton, styles.endCallButton]}
                    onPress={handleLeaveCall}>
                    <IconSymbol
                        name="phone.down.fill"
                        size={24}
                        color="#FFFFFF"
                    />
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    grid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 48,
        gap: 16,
    },
    controlButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2C2C2E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonOff: {
        backgroundColor: '#FF3B30',
    },
    endCallButton: {
        backgroundColor: '#FF3B30',
    },
    joinButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        backgroundColor: '#007AFF',
        borderRadius: 12,
    },
    joinButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default CallScreen;