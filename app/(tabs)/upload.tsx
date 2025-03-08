import React, { useState } from "react";
import { View, Button, Text, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function UploadScreen() {
    const [status, setStatus] = useState("");

    const uploadVideo = async () => {
        // Request permissions to access photo library
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission Required", "Please allow access to your photo library.");
            return;
        }

        // Pick a video from the Photos app
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos, // Only allow videos
            allowsEditing: false,
            quality: 1, // Keep original quality
        });

        if (result.canceled) return;
        let video = result.assets[0]; // Get selected video

        const formData = new FormData();
        formData.append("video", {
            uri: video.uri,
            name: "upload.mp4",
            type: "video/mp4",
        });

        setStatus("Uploading...");

        try {
            let response = await axios.post("https://worthy-fascination.railway.app/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setStatus(response.status === 200 ? "✅ Upload successful!" : "❌ Upload failed!");
        } catch (error) {
            setStatus("❌ Error uploading video.");
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
            <Button title="Select Video from Photos" onPress={uploadVideo} />
            <Text style={{ marginTop: 20 }}>{status}</Text>
        </View>
    );
}
