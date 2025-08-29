import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

async function callGemini(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        return `An error occurred while communicating with the AI service: ${error instanceof Error ? error.message : String(error)}`;
    }
}

export async function analyzeCode(code: string): Promise<string> {
  const prompt = `
    You are a friendly and helpful AI programming assistant. A user has requested help with their code.
    Analyze the provided code snippet and provide a comprehensive report.

    Your analysis should include:
    1.  **Code Explanation**: A clear, line-by-line or block-by-block explanation of what the code does.
    2.  **Suggestions for Improvement**: Specific, actionable suggestions to improve code quality, readability, and performance. Provide code examples for your suggestions.
    3.  **Bug Detection**: Identify any potential bugs, logical errors, or edge cases the user might not have considered.

    Format your response using markdown-style headings (e.g., "### Code Explanation").
    Be encouraging and supportive in your tone.

    Code to analyze:
    ---
    ${code}
    ---
  `;
  return callGemini(prompt);
}

export async function simulateTest(code: string): Promise<string> {
  const prompt = `
    You are an expert QA engineer. Your task is to write unit tests for the given code snippet using a modern JavaScript testing framework syntax like Jest or Vitest.

    Your response should include:
    1.  **Test Suite**: A complete \`describe\` block containing several \`it\` or \`test\` blocks.
    2.  **Test Cases**: Cover happy paths, edge cases, and potential error conditions.
    3.  **Explanations**: Briefly comment on what each test case is verifying.

    Format your response as a single code block ready to be copied into a test file.
    Do not add any conversational filler. Be direct and professional.
    
    Code to test:
    ---
    ${code}
    ---
  `;

  return callGemini(prompt);
}