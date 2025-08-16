import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const { transcript, customPrompt } = await request.json()

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 })
    }

    // Build the prompt for AI summarization
    const systemPrompt = `You are an expert meeting summarizer. Your task is to create clear, structured summaries of meeting transcripts that are actionable and easy to understand.

Default format unless specified otherwise:
- **Key Points**: Main topics discussed
- **Decisions Made**: Important decisions and outcomes
- **Action Items**: Tasks assigned with responsible parties
- **Next Steps**: Follow-up actions and deadlines

Keep summaries concise but comprehensive. Use bullet points and clear headings for readability.`

    const userPrompt = customPrompt
      ? `Please summarize the following meeting transcript according to these specific instructions: "${customPrompt}"\n\nTranscript:\n${transcript}`
      : `Please summarize the following meeting transcript:\n\nTranscript:\n${transcript}`

    console.log("[v0] Generating summary with Groq AI")

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 1000,
      temperature: 0.3,
    })

    console.log("[v0] Summary generated successfully")

    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error("[v0] Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary. Please try again." }, { status: 500 })
  }
}
