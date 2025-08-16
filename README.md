# AI Meeting Summarizer

A web application that transforms meeting transcripts into structured, actionable summaries using AI technology.

## Features

- Upload meeting transcripts via file upload or direct text input
- AI-powered summarization with customizable instructions
- Edit and refine generated summaries
- Share summaries via email
- Copy and download functionality
- Progress tracking throughout the workflow

## Technology Stack

- Next.js 15 with TypeScript
- Groq AI API for text summarization
- Tailwind CSS for styling
- Radix UI components

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Get your Groq API key from https://console.groq.com/keys
   - Add your API key to `.env.local`:
     ```
     GROQ_API_KEY=your_api_key_here
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## Usage

1. Upload a text file or paste your meeting transcript
2. Optionally add custom summarization instructions
3. Click "Generate Summary" to create an AI summary
4. Edit the summary if needed
5. Share via email, copy to clipboard, or download as a file

## API Endpoints

- `/api/summarize` - Generates AI summaries from transcripts
- `/api/send-email` - Handles email sharing functionality

## Environment Variables

- `GROQ_API_KEY` - Required for AI summarization functionality