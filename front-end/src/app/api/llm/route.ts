import { NextResponse } from "next/server";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    console.log("Received request body:", body);

    // Forward the request to the LLM API
    const userId = body.user_id || "default_user";
    const url = API_URL + `/get_LLM_response?userId=${userId}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        query: body.query.toString(),
      }),
    });

    // Ensure the response is valid JSON and parse it once
    const responseData = await response.json(); // Read response once
    console.log("Response from LLM API:", responseData);
    
    // Return the response in a proper JSON format
    return NextResponse.json(responseData.response);

  } catch (error) {
    console.error("Error in LLM API route:", error);
    return NextResponse.json({ error: "Failed to process your request" }, { status: 500 });
  }
}
