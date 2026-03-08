import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post(`/api/parse-job`, (req, res) => {
    const { text, url } = req.body;

    console.log(`Received job data for URL: ${url}`);
    console.log(`Text length: ${text?.length ?? 0} characters`);

    res.json({
        success: true,
        message: `Received data for ${url}`,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
