import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Saves extracted job data to a Notion database via the
 * official Notion MCP server spawned with npx.
 *
 * @param {{ company, role, location, salary, techStack, url }} jobData
 */
export async function saveToNotion(jobData) {
    const transport = new StdioClientTransport({
        command: `npx`,
        args: [`-y`, `@notionhq/notion-mcp-server`],
        env: {
            ...process.env,
            OPENAPI_MCP_HEADERS: JSON.stringify({
                Authorization: `Bearer ${process.env.NOTION_API_TOKEN}`,
                [`Notion-Version`]: `2022-06-28`,
            }),
        },
    });

    const client = new Client(
        { name: `notion-mcp-job-tracker`, version: `1.0.0` },
        { capabilities: {} }
    );

    await client.connect(transport);

    try {
        // --- Discover available tool names ---
        const { tools } = await client.listTools();
        console.log(
            `\nAvailable Notion MCP tools:\n`,
            tools.map((t) => t.name)
        );

        // Find the correct "create page" tool dynamically
        const createPageTool = tools.find(
            (t) =>
                t.name.toLowerCase().includes(`page`) &&
                (t.name.toLowerCase().includes(`create`) ||
                    t.name.toLowerCase().includes(`post`))
        );

        if (!createPageTool) {
            throw new Error(
                `Could not find a create-page tool. Available tools: ${tools.map((t) => t.name).join(`, `)}`
            );
        }

        console.log(`Using tool: ${createPageTool.name}`);

        const databaseId = process.env.NOTION_DATABASE_ID;

        const properties = {
            Company: {
                title: [{ text: { content: jobData.company } }],
            },
            Role: {
                rich_text: [{ text: { content: jobData.role } }],
            },
            Location: {
                rich_text: [{ text: { content: jobData.location } }],
            },
            Salary: {
                rich_text: [{ text: { content: jobData.salary } }],
            },
            [`Tech Stack`]: {
                multi_select: jobData.techStack.map((tech) => ({ name: tech })),
            },
            Status: {
                select: { name: `Applied` },
            },
            URL: {
                url: jobData.url,
            },
        };

        console.log(`Saving job to Notion database: ${databaseId}`);

        const result = await client.callTool({
            name: createPageTool.name,
            arguments: {
                parent: { database_id: databaseId },
                properties,
            },
        });

        console.log(`Notion MCP response:`, JSON.stringify(result, null, 2));
        return result;
    } finally {
        await client.close();
    }
}
