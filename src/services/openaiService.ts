import OpenAI from "openai";
import { openaiApiKey } from "../config/config";

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

export const generateDailyQuestion = async (): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content:
            "Generate a fun and engaging daily question for a chat conversation.",
        },
      ],
      max_tokens: 50,
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "What's your favorite hobby?"
    );
  } catch (error) {
    console.error("Error generating daily question:", error);
    throw error;
  }
};
