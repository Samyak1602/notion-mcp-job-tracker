import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Uses Groq (Llama 3) to extract structured job details from raw page text.
 * Groq free tier: ~14,400 requests/day, no credit card required.
 *
 * @param {string} text - Raw text scraped from a job listing page
 * @returns {Promise<{company, role, location, salary, techStack}>}
 */
export async function extractJobDetails(text) {
    const completion = await groq.chat.completions.create({
        model: `llama-3.3-70b-versatile`,
        messages: [
            {
                role: `system`,
                content: `You are a job listing parser. Extract structured information from job page text.
Return ONLY a valid JSON object with exactly these fields:
- company: string (company name, or "Not specified" if not found)
- role: string (job title, e.g. "SDE Intern", or "Not specified" if not found)
- location: string (city/country/remote, or "Not specified" if not found)
- salary: string (salary/compensation range, or "Not specified" if not found)
- techStack: array of strings (languages, frameworks, tools — empty array if none)

Return ONLY raw JSON. No explanation, no markdown fences.`,
            },
            {
                role: `user`,
                content: `Extract job details from this job page text:\n\n${text.slice(0, 12000)}`,
            },
        ],
        response_format: { type: `json_object` },
        temperature: 0,
    });

    const raw = completion.choices[0].message.content;

    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        console.error(`Failed to parse Groq response:`, raw);
        parsed = {};
    }

    return {
        company: parsed.company ?? `Not specified`,
        role: parsed.role ?? `Not specified`,
        location: parsed.location ?? `Not specified`,
        salary: parsed.salary ?? `Not specified`,
        techStack: Array.isArray(parsed.techStack) ? parsed.techStack : [],
    };
}
