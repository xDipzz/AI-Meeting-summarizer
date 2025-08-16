import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const { transcript, customPrompt } = await request.json()

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 })
    }

    // Check if Groq API key is configured
    const apiKey = process.env.GROQ_API_KEY?.trim()
    console.log("[v0] API Key check:", { 
      exists: !!apiKey, 
      length: apiKey?.length, 
      startsWith: apiKey?.substring(0, 4) 
    })
    
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      console.error("[v0] Groq API key not configured")
      return NextResponse.json({ 
        error: "Groq API key not configured. Please add your GROQ_API_KEY to .env.local file. Get your key from https://console.groq.com/keys" 
      }, { status: 500 })
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
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 1000,
      temperature: 0.3,
    })

    console.log("[v0] Summary generated successfully")

    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error("[v0] Error generating summary:", error)
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate summary. Please try again."
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = "Groq API key is invalid or missing. Please check your API key configuration."
      } else if (error.message.includes('rate limit')) {
        errorMessage = "Rate limit exceeded. Please try again in a few minutes."
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else {
        errorMessage = `API Error: ${error.message}`
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
