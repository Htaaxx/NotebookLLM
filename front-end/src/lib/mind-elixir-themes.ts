export interface MindMapTheme {
  name: string
  background: string
  color: string
  nodeStyles: {
    root: {
      background?: string
      color?: string
      fontSize?: string
      fontWeight?: string
      borderRadius?: string
      padding?: string
    }
    primary: {
      background?: string
      color?: string
      fontSize?: string
      fontWeight?: string
      borderRadius?: string
      padding?: string
    }
    secondary: {
      background?: string
      color?: string
      fontSize?: string
      fontWeight?: string
      borderRadius?: string
      padding?: string
    }
  }
  nodeColors?: {
    root?: string
    level1?: string[]
    level2?: string[]
  }
  lineStyle: {
    color: string
    width: number
    dashArray?: string
  }
}

// Theme templates for different mindmap styles
export const themeTemplates: Record<string, string> = {
  original: `# Machine Learning Concepts

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
#### Regularization`,

  academic: `# Data Science Fundamentals

## Statistical Methods
### Descriptive Statistics
#### Measures of Central Tendency
#### Measures of Dispersion
### Inferential Statistics
#### Hypothesis Testing
#### Confidence Intervals
#### p-values

## Machine Learning
### Supervised Learning
#### Classification Algorithms
#### Regression Algorithms
### Unsupervised Learning
#### Clustering
#### Dimensionality Reduction
### Model Evaluation
#### Cross-Validation
#### Metrics

## Data Processing
### Data Cleaning
#### Handling Missing Values
#### Outlier Detection
### Feature Engineering
#### Feature Selection
#### Feature Extraction`,

  business: `# Business Strategy

## Market Analysis
### Competitor Research
#### SWOT Analysis
#### Market Share
### Customer Segmentation
#### Demographics
#### Behavioral Patterns
#### Psychographics

## Financial Planning
### Revenue Streams
#### Product Sales
#### Service Subscriptions
### Cost Structure
#### Fixed Costs
#### Variable Costs
### Investment Strategy
#### ROI Analysis
#### Risk Assessment

## Growth Strategy
### Expansion Options
#### New Markets
#### Product Development
### Partnership Opportunities
#### Strategic Alliances
#### Acquisitions`,
}

// Define available themes
export const allThemes: MindMapTheme[] = [
  {
    name: "original",
    background: "#f5f5f5",
    color: "#333",
    nodeStyles: {
      root: {
        background: "#4caf50",
        color: "#fff",
        fontSize: "18px",
        fontWeight: "bold",
        borderRadius: "5px",
        padding: "10px 15px",
      },
      primary: {
        background: "#2196f3",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "5px",
        padding: "8px 12px",
      },
      secondary: {
        background: "#f5f5f5",
        color: "#333",
        fontSize: "14px",
        fontWeight: "normal",
        borderRadius: "5px",
        padding: "6px 10px",
      },
    },
    nodeColors: {
      root: "#4caf50",
      level1: ["#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50"],
      level2: ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5"],
    },
    lineStyle: {
      color: "#999",
      width: 2,
    },
  },
  {
    name: "academic",
    background: "#ffffff",
    color: "#000000",
    nodeStyles: {
      root: {
        background: "#000000",
        color: "#ffffff",
        fontSize: "18px",
        fontWeight: "bold",
        borderRadius: "0px",
        padding: "10px 15px",
      },
      primary: {
        background: "#ffffff",
        color: "#000000",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "0px",
        padding: "8px 12px",
      },
      secondary: {
        background: "#f5f5f5",
        color: "#333333",
        fontSize: "14px",
        fontWeight: "normal",
        borderRadius: "0px",
        padding: "6px 10px",
      },
    },
    lineStyle: {
      color: "#000000",
      width: 1,
      dashArray: "5,5",
    },
  },
  {
    name: "business",
    background: "#f8f9fa",
    color: "#343a40",
    nodeStyles: {
      root: {
        background: "#343a40",
        color: "#ffffff",
        fontSize: "18px",
        fontWeight: "bold",
        borderRadius: "3px",
        padding: "10px 15px",
      },
      primary: {
        background: "#6c757d",
        color: "#ffffff",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "3px",
        padding: "8px 12px",
      },
      secondary: {
        background: "#e9ecef",
        color: "#343a40",
        fontSize: "14px",
        fontWeight: "normal",
        borderRadius: "3px",
        padding: "6px 10px",
      },
    },
    nodeColors: {
      root: "#343a40",
      level1: ["#495057", "#6c757d", "#adb5bd"],
      level2: ["#ced4da", "#dee2e6", "#e9ecef"],
    },
    lineStyle: {
      color: "#6c757d",
      width: 1,
    },
  },
]

// Helper function to apply theme to a node
export function applyThemeToNode(node: HTMLElement, theme: MindMapTheme, level: number, index: number): void {
  // Determine which style to apply based on level
  let style
  let background

  if (level === 0) {
    style = theme.nodeStyles.root
    background = theme.nodeColors?.root || style.background
  } else if (level === 1) {
    style = theme.nodeStyles.primary
    if (theme.nodeColors?.level1) {
      const colorIndex = index % theme.nodeColors.level1.length
      background = theme.nodeColors.level1[colorIndex]
    } else {
      background = style.background
    }
  } else {
    style = theme.nodeStyles.secondary
    if (theme.nodeColors?.level2) {
      const colorIndex = index % theme.nodeColors.level2.length
      background = theme.nodeColors.level2[colorIndex]
    } else {
      background = style.background
    }
  }

  // Apply styles
  if (background) node.style.backgroundColor = background
  if (style.color) node.style.color = style.color
  if (style.fontSize) node.style.fontSize = style.fontSize
  if (style.fontWeight) node.style.fontWeight = style.fontWeight
  if (style.borderRadius) node.style.borderRadius = style.borderRadius
  if (style.padding) node.style.padding = style.padding
}

// Helper function to customize connection lines
export function customizeLines(container: HTMLElement, theme: MindMapTheme): void {
  const lines = container.querySelectorAll(".map-container .line")
  lines.forEach((line) => {
    const svgLine = line.querySelector("path")
    if (svgLine) {
      svgLine.setAttribute("stroke", theme.lineStyle.color)
      svgLine.setAttribute("stroke-width", theme.lineStyle.width.toString())
      if (theme.lineStyle.dashArray) {
        svgLine.setAttribute("stroke-dasharray", theme.lineStyle.dashArray)
      }
    }
  })
}
