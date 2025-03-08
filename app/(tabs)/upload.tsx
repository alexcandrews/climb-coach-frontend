import React, { useState } from "react";
import { View, Button, Text, Alert, ActivityIndicator, ScrollView, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function UploadScreen() {
    const [status, setStatus] = useState("");
    const [uploading, setUploading] = useState(false);
    const [coachingInsights, setCoachingInsights] = useState([]);

    const uploadVideo = async () => {
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
            });
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

                // 🔥 Fix: Ensure JSON response is correctly parsed
                let insights = response.data.coaching_moments;

                // If the response is a stringified JSON inside a string, parse it
                if (typeof insights === "string") {
                    insights = JSON.parse(insights.replace(/```json|```/g, "").trim());
                }

                setCoachingInsights(insights);
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Button title="Select Video from Photos" onPress={uploadVideo} />
            <Text style={{ marginTop: 20 }}>{status}</Text>
            {uploading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

            {/* 🔥 Display coaching insights in a simple list */}
            {coachingInsights.length > 0 && (
                <ScrollView style={{ marginTop: 20, width: "100%" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold" }}>Coaching Insights:</Text>
                    {coachingInsights.map((tip, index) => (
                        <View key={index} style={{ marginBottom: 10, padding: 10, backgroundColor: "#f0f0f0", borderRadius: 8 }}>
                            <Text style={{ fontSize: 16, fontWeight: "bold" }}>⏱️ {tip.timestamp}s</Text>
                            <Text style={{ fontSize: 14, marginTop: 5 }}>{tip.coaching}</Text>
                            <Text style={{ fontSize: 12, color: "gray", marginTop: 5 }}>
                                Type: {tip.type} | Confidence: {tip.confidence}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
