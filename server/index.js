import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { extractJobDetails } from "./aiService.js";
import { saveToNotion } from "./mcpService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post(`/api/parse-job`, async (req, res) => {
    const { text, url } = req.body;

    console.log(`\nReceived job data for URL: ${url}`);

    try {
        console.log(`Extracting job details with AI...`);
        const jobDetails = await extractJobDetails(text);

        console.log(`Extracted details:`, jobDetails);

        const jobData = { ...jobDetails, url };

        console.log(`Saving to Notion via MCP...`);
        await saveToNotion(jobData);

        res.json({
            success: true,
            message: `Job saved to Notion: ${jobData.role} at ${jobData.company}`,
            data: jobData,
        });
    } catch (err) {
        console.error(`Error processing job:`, err);
        res.status(500).json({
            success: false,
            message: `Failed to process job: ${err.message}`,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
