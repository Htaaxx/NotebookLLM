const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000"

// Add POST handler
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Check if document_ids exists and log it
    if (!body.document_ids) {
      console.error("document_ids is undefined in request body:", body)
      return new Response("Missing document_ids in request body", { status: 400 })
    }

    console.log("Received request body:", body.document_ids)
    const num_clusters = 5

    const url = API_URL + `/get_smaller_branches_from_docs?num_clusters=${num_clusters}`

    // Make the request to the backend API with properly formatted JSON
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Charset": "UTF-8", // Explicitly request UTF-8 encoding
      },
      // Send just the array of document IDs
      body: JSON.stringify(body.document_ids),
    })

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      // Return default markdown if the API fails
      return new Response(DEFAULT_MARKDOWN, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    }

    try {
      // Try to get the response as text
      const data = await response.text()
      return new Response(data, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    } catch (encodingError) {
      console.error("Error processing response text:", encodingError)
      return new Response(DEFAULT_MARKDOWN, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    }
  } catch (error) {
    console.error("Error in drawMindMap POST:", error)
    // Return default markdown if there's an error
    return new Response(DEFAULT_MARKDOWN, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  }
}

// Default markdown to use when API fails
const DEFAULT_MARKDOWN = `# Machine Learning Concepts

## Supervised Learning
### Classification
#### Decision Trees
#### Support Vector Machines
#### Neural Networks
### Regression
#### Linear Regression
#### Polynomial Regression

## Unsupervised Learning
### Clustering
#### K-Means
#### Hierarchical Clustering
### Dimensionality Reduction
#### PCA
#### t-SNE

## Reinforcement Learning
### Q-Learning
### Deep Q Networks

## Deep Learning
### Neural Networks
#### Feed Forward Networks
#### Convolutional Neural Networks
#### Recurrent Neural Networks
### Training Techniques
#### Backpropagation
#### Gradient Descent
#### Regularization
`

