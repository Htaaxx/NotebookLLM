import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    console.log("Received request to generate questions:", body)

    // Extract data from the request
    const { user_id, node_title, node_content, paths } = body

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id in request" }, { status: 400 })
    }

    // Call the backend API to generate questions
    const url = `${API_URL}/generate_questions`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        user_id,
        node_title,
        node_content,
        paths,
      }),
    })

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      return NextResponse.json({ error: `Backend API error: ${response.status}` }, { status: response.status })
    }

    // Parse and return the response
    const data = await response.json()
    console.log("Questions generated successfully:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json(
      { error: `Failed to generate questions: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
