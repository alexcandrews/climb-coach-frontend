require("dotenv").config();
const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static"); // Use the static version
ffmpeg.setFfmpegPath(ffmpegPath); // Tell fluent-ffmpeg to use it
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY || OPENAI_API_KEY === "your_fallback_key_here") {
    console.error("❌ Missing OpenAI API key! Please set it in Railway's environment variables.");
    process.exit(1); // Stop the server if API key is missing
}

// Create necessary directories if they don't exist
const uploadsDir = "uploads";
const framesDir = "frames";
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(framesDir)) fs.mkdirSync(framesDir);

// Enable CORS for frontend requests
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Configure Multer for handling file uploads
const upload = multer({ dest: uploadsDir });

// Handle video upload and processing
app.post("/upload", upload.single("video"), async (req, res) => {
    try {
        const videoPath = req.file.path;

        console.log("📸 Extracting frames...");

        // Extract multiple frames
        const framePaths = await extractFrames(videoPath, framesDir);

        console.log("✅ Frames extracted, sending to OpenAI...");

        // Send all frames to OpenAI
        const coachingData = await getClimbingInsights(framePaths);

        // Return coaching insights
        res.json({ coaching_moments: coachingData });

    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({ error: "An error occurred during processing." });
    }
});

// Extract key frames from the video and resize them
async function extractFrames(videoPath, outputDir) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .output(`${outputDir}/frame_%04d.jpg`)
            .fps(1) // Extract 1 frame per second
            .on("end", async () => {
                let frameFiles = fs.readdirSync(outputDir).filter(f => f.startsWith("frame_")).slice(0, 5); // Take 5 frames

                if (frameFiles.length === 0) {
                    console.error("❌ No frames extracted!");
                    reject(new Error("No frames extracted."));
                    return;
                }

                console.log(`✅ Extracted frames: ${frameFiles.join(", ")}`);

                // Resize & Save images locally
                const resizedImages = [];
                await Promise.all(frameFiles.map(async (file, index) => {
                    const inputPath = path.join(outputDir, file);
                    const outputPath = path.join(outputDir, `resized_frame_${index + 1}.jpg`);

                    await sharp(inputPath)
                        .resize({ width: 512 }) // Resize to 512px width
                        .jpeg({ quality: 80 })  // Compress to 80% quality
                        .toFile(outputPath);

                    console.log(`🖼️ Saved resized frame: ${outputPath}`);
                    resizedImages.push(outputPath);
                }));

                resolve(resizedImages); // Return array of resized frame paths
            })
            .on("error", reject)
            .run();
    });
}

// Convert an image to Base64 format
function encodeImage(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString("base64");
}

// Send multiple frames to OpenAI for analysis
async function getClimbingInsights(imagePaths) {
    console.log(`📤 Sending ${imagePaths.length} images to OpenAI Vision API...`);

    // Convert each image to Base64 format for OpenAI
    const base64Images = imagePaths.map(imagePath => ({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${encodeImage(imagePath)}` }
    }));

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: `
                        You are an expert rock climbing coach. Your job is to analyze a sequence of climbing images and provide **structured coaching insights**.
                        
                        **Rules for analysis:**
                        - Identify the climber's **movement efficiency**, **balance improvement**, and **strength correction**.
                        - Compare **movement across frames** and identify key improvements.
                        - Provide feedback in **structured JSON format** as follows:

                        **JSON Format for Response:**
                        \`\`\`json
                        [
                            {
                                "timestamp": [estimated time in seconds],
                                "coaching": "[specific feedback on movement or positioning]",
                                "type": "[either 'movement efficiency', 'balance improvement', or 'strength correction']",
                                "confidence": [a score between 0-1 representing certainty]
                            }
                        ]
                        \`\`\`

                        **Important Focus Areas:**
                        - Detect **weight shifting issues** and whether the climber is using their legs efficiently.
                        - Identify **foot placement mistakes** (e.g., heel placement, foot slippage).
                        - Detect **over-reliance on upper body strength** vs. leg-driven movement.
                        - Provide **constructive feedback** that is easy to apply.
                        `
                    },
                    { role: "user", content: "Analyze these climbing frames as a sequence and provide coaching insights based on movement patterns, foot placement, and balance." },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "These images show a sequence of movements from a climber on an indoor 6A route. Identify how the climber's movement evolves between frames and detect areas where technique needs improvement." },
                            { type: "text", text: "Focus on weight shifting, body positioning, and use of dynamic movement. Highlight the most important coaching points in the sequence." },
                            ...base64Images  // Send all images in one request
                        ]
                    }
                ],
                max_tokens: 1000
            },
            { headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" } }
        );

        console.log("✅ OpenAI Response:", response.data.choices[0].message.content);
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ OpenAI API Error:", error.response ? error.response.data : error.message);
        return { error: "Failed to get response from OpenAI." };
    }
}


// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
