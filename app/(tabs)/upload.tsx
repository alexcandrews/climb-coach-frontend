import React, { useState, useRef, useEffect } from "react";
import { View, Alert, StyleSheet, Platform, Switch, Text, SafeAreaView } from "react-native";
import { Video } from 'expo-av';
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AuthStatus from '../components/AuthStatus';
import VideoPlayer from '../components/VideoPlayer';
import Timeline from '../components/Timeline';

// Import seed data
const SEED_VIDEO_URI = require('../../seeds/climbing-video.mp4');
const SEED_COACHING_MOMENTS = require('../../seeds/coaching-moments.json');

interface CoachingInsight {
    timestamp: number;
    coaching: string;
    type: string;
    confidence: number;
}

const parseCoachingMoments = (data: any): CoachingInsight[] => {
    try {
        if (typeof data === 'string') {
            // Remove markdown code block syntax and parse
            return JSON.parse(data.replace(/```json\n|\n```/g, ''));
        } else if (data.coaching_moments) {
            // Handle the case where it's wrapped in coaching_moments
            return JSON.parse(data.coaching_moments.replace(/```json\n|\n```/g, ''));
        } else if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch (error) {
        console.error('Error parsing coaching moments:', error);
        return [];
    }
};

export default function UploadScreen() {
    const [status, setStatus] = useState("");
    const [uploading, setUploading] = useState(false);
    const [coachingInsights, setCoachingInsights] = useState<CoachingInsight[]>([]);
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [useSeedData, setUseSeedData] = useState(__DEV__);
    const videoRef = useRef<Video>(null);

    // Load seed data when useSeedData is enabled
    useEffect(() => {
        if (useSeedData) {
            console.log('Loading seed data...'); // Debug log
            setVideoUri(SEED_VIDEO_URI);
            const parsedMoments = parseCoachingMoments(SEED_COACHING_MOMENTS);
            console.log('Parsed coaching moments:', parsedMoments); // Debug log
            setCoachingInsights(parsedMoments);
            setStatus("Using seed data");
        } else {
            console.log('Clearing seed data...'); // Debug log
            setVideoUri(null);
            setCoachingInsights([]);
            setVideoDuration(0);
            setStatus("");
        }
    }, [useSeedData]);

    const handleVideoLoad = (duration: number) => {
        console.log('Video loaded with duration:', duration);
        setVideoDuration(duration);
    };

    const handlePositionChange = (position: number) => {
        setCurrentPosition(position);
    };

    const handleSeek = (position: number) => {
        console.log('Seeking to position:', position);
        if (videoRef.current) {
            setCurrentPosition(position);
        }
    };

    const uploadVideo = async () => {
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

        // Set the video URI for playback
        setVideoUri(video.uri);
        setVideoDuration(0); // Reset duration until new video loads

        const formData = new FormData();

        if (Platform.OS === "web") {
            // Special handling for web
            const response = await fetch(video.uri);
            const blob = await response.blob();
            formData.append("video", new File([blob], "upload.mp4", { type: "video/mp4" }));
        } else {
            // Mobile (iOS/Android)
            formData.append("video", {
                uri: video.uri,
                name: "upload.mp4",
                type: "video/mp4",
            } as any);
        }

        setStatus("Uploading...");
        setUploading(true);

        try {
            let response = await axios.post(
                "https://climb-coach-backend-production.up.railway.app/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 200) {
                setStatus("✅ Upload successful! Processing...");
                const parsedMoments = parseCoachingMoments(response.data.coaching_moments);
                setCoachingInsights(parsedMoments);
            } else {
                setStatus("❌ Upload failed!");
            }
        } catch (error) {
            console.error("❌ Upload Error:", error);
            setStatus("❌ Error uploading video.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Development Mode Toggle */}
            {__DEV__ && (
                <View style={styles.devModeContainer}>
                    <Text style={styles.devModeText}>Use Seed Data</Text>
                    <Switch
                        value={useSeedData}
                        onValueChange={setUseSeedData}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={useSeedData ? '#2196F3' : '#f4f3f4'}
                    />
                </View>
            )}
            
            <View style={styles.headerContainer}>
                <AuthStatus />
            </View>

            <VideoPlayer 
                videoUri={videoUri}
                videoRef={videoRef}
                onSelectVideo={uploadVideo}
                onLoadComplete={handleVideoLoad}
                onPositionChange={handlePositionChange}
                seekTo={currentPosition}
            />
            <Timeline 
                uploading={uploading}
                status={status}
                coachingInsights={coachingInsights}
                videoDuration={videoDuration}
                currentPosition={currentPosition}
                onSeek={handleSeek}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        paddingVertical: 10,
        backgroundColor: 'transparent',
    },
    devModeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 10,
        backgroundColor: '#FFE082',
        borderBottomWidth: 1,
        borderBottomColor: '#FFD54F',
    },
    devModeText: {
        marginRight: 10,
        fontSize: 14,
        fontWeight: '500',
    },
});
