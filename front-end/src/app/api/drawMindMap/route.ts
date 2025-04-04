import { NextResponse } from "next/server"
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000"

// Add POST handler
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received request body:", body.document_ids)
    const num_clusters = 5

    const url = API_URL + `/get_smaller_branches_from_docs?num_clusters=${num_clusters}`

    // Make the request to the backend API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: (body.document_ids),
    })

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      // Return default markdown if the API fails
      return new Response(DEFAULT_MARKDOWN, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

    const data = await response.text()
    return new Response(data, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Error in drawMindMap POST:", error)
    // Return default markdown if there's an error
    return new Response(DEFAULT_MARKDOWN, {
      headers: {
        "Content-Type": "text/plain",
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