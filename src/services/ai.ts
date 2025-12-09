export interface DiagnosisResult {
    diagnosis: string;
    estimatedCost: string;
    estimatedTime: string;
    recommendedService: string;
}

export const analyzeIssue = async (
    description: string,
    images: File[] = []
): Promise<DiagnosisResult> => {
    try {
        // Validate API key
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("Gemini API key not configured. Please restart your dev server after adding the key to .env");
        }

        // Use the exact model name for free tier: gemini-1.5-flash-latest
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const prompt = `You are an expert technician. Analyze the following device/appliance issue and provide a diagnosis.

Issue Description: "${description}"

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, no extra text):
{
  "diagnosis": "Brief diagnosis of the problem",
  "estimatedCost": "Estimated cost range in INR (e.g., ₹1,200 - ₹2,500)",
  "estimatedTime": "Estimated repair time (e.g., 1-2 hours)",
  "recommendedService": "Name of the service required (e.g., Screen Replacement)"
}`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        console.log("Sending request to Gemini API...");

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log("API response:", data);

        if (!response.ok) {
            console.error("API Error:", data);

            if (data.error?.message) {
                throw new Error(data.error.message);
            }

            throw new Error(`API request failed: ${response.status}`);
        }

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No response from AI");
        }

        console.log("AI response:", text);

        // Clean up markdown code blocks if present
        let cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        const parsed = JSON.parse(cleanText);
        console.log("Parsed result:", parsed);

        return parsed;
    } catch (error: any) {
        console.error("AI Analysis failed:", error);
        throw new Error(error.message || "Failed to analyze issue. Please try again.");
    }
};
