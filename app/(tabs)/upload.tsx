import React, { useState } from "react";
import { View, Alert, StyleSheet, ScrollView, TouchableOpacity, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from '@expo/vector-icons';
import { DEV_MODE } from '../config';
import { useRouter } from 'expo-router';
import Colors from "../../constants/Colors";
import LogoHeader from "@/components/LogoHeader";
import { APP_TEXT_STYLES } from "@/constants/Typography";

// Import video services
import { 
    CoachingInsight
} from '@/lib/api/videos';

// Import seed data for development
const SEED_VIDEO_URI = require('../../seeds/climbing-video-03mb.mp4');
const SEED_COACHING_MOMENTS = require('../../seeds/coaching-moments.json');

export default function UploadScreen() {
    const [status, setStatus] = useState("");
    const [coachingInsights, setCoachingInsights] = useState<CoachingInsight[]>([]);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    // Use seed data in development mode (set to false by default)
    const useSeedData = DEV_MODE && false;

    // Handle video selection
    const handleVideoUpload = async () => {
        if (useSeedData) {
            Alert.alert("Development Mode", "Using seed data instead of uploading");
            return;
        }

        // Request permissions to access photo library
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Required", "Please allow access to your photo library.");
            return;
        }

        // Pick a video from the Photos app
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: false,
            quality: 1,
        });

        if (result.canceled) return;
        let video = result.assets[0];

        // Navigate to the new details screen with the video URI
        router.push({ pathname: '/upload/video-details', params: { videoUri: video.uri } });
    };

    // Hide status bar for this screen
    React.useEffect(() => {
        StatusBar.setHidden(true);
        return () => {
            StatusBar.setHidden(false);
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <LogoHeader marginBottom={60} />
                <Text style={[APP_TEXT_STYLES.screenTitle, styles.title]}>Upload Climb</Text>
                
                <TouchableOpacity 
                    style={styles.uploadButton} 
                    onPress={handleVideoUpload}
                >
                    <FontAwesome name="plus" size={40} color="#fff" />
                </TouchableOpacity>
                <Text style={[APP_TEXT_STYLES.cardTitle, styles.uploadText]}>Upload Video</Text>
                <Text style={[APP_TEXT_STYLES.bodyTextMuted, styles.uploadDescription]}>
                    Upload a video of your climb to receive feedback.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000, 
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        justifyContent: "flex-start",
        paddingTop: 30,
        alignItems: "center",
        maxWidth: 360,
        width: '100%',
        alignSelf: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
    },
    uploadButton: {
        width: 180,
        height: 180,
        borderRadius: 12,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    uploadText: {
        marginVertical: 10,
    },
    uploadDescription: {
        textAlign: 'center',
        marginTop: 10,
    }
});
