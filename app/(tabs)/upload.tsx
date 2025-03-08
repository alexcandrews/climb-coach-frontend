import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";

export default function UploadScreen() {
    const [status, setStatus] = useState("");

    const uploadVideo = async () => {
        let result = await DocumentPicker.getDocumentAsync({ type: "video/*" });

        if (result.canceled) return;
        let file = result.assets[0];

        const formData = new FormData();
        formData.append("video", {
            uri: file.uri,
            name: file.name,
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
            <Button title="Select Video" onPress={uploadVideo} />
            <Text style={{ marginTop: 20 }}>{status}</Text>
        </View>
    );
}
