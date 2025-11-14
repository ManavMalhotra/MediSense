import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { userMessage } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await model.generateContent(userMessage);
    const aiText = response.response.text();

    return new Response(JSON.stringify({ reply: aiText }), {
      status: 200,
    });
  } catch (error) {
    console.error("Gemini error:", error);
    return new Response(JSON.stringify({ reply: "Something went wrong." }), {
      status: 500,
    });
  }
}
