//import type { MindMapTheme } from "./types/mind-elixir-types"

// Type definitions for mind-elixir themes

export interface NodeStyle {
    background: string
    color: string
    fontSize: string
    fontWeight: string
    borderRadius: string
    padding: string
    border?: string
    boxShadow?: string
  }
  
  export interface LineStyle {
    color: string
    width: string
    dash: boolean
    lineType: "straight" | "curved"
  }
  
  export interface ArrowStyle {
    color: string
    size: string
  }
  
  export interface NodeColors {
    root: string
    level1: string[]
    level2: string[]
  }
  
  export interface MindMapTheme {
    name: string
    displayName: string
    background: string
    color: string
    nodeColors?: NodeColors
    nodeStyles: {
      root: NodeStyle
      primary: NodeStyle
      secondary: NodeStyle
    }
    lineStyle: LineStyle
    arrowStyle?: ArrowStyle
  }
  
  

// Define the theme templates - markdown content for each theme
export const themeTemplates = {
  original: `# Mind Map
## Topic 1
### Subtopic 1.1
### Subtopic 1.2
## Topic 2
### Subtopic 2.1
### Subtopic 2.2
## Topic 3
### Subtopic 3.1
### Subtopic 3.2
## Topic 4
### Subtopic 4.1
### Subtopic 4.2`,

  planner: `# Mind Map Planner
## Project
### Goal
### Timeline
### Resources
## Ideas
### Concept 1
### Concept 2
### Concept 3
## Tasks
### To-Do
### In Progress
### Completed
## Notes
### Key Points
### Questions
### References`,

  pastel: `# Mind Mapping
## Habits
### Plan
### Study
### System
## Organization
## Learning Style
### Read
### Listen
### Summarize
## Goals
### Research
### Lecture
### Conclusions
## Motivation
### Tips
### Roadmap
## Review
### Notes
### Method
### Discuss`,

  creative: `# Mental Map
## Audience test
## Definition of persona
## Innovation
## Creating solutions
## Creativity
## Market research`,

  strategy: `# Marketing Strategy
## Market Analysis
### Target Audience
### Competitors
### Trends
## Brand Identity
### Values
### Messaging
### Visual Elements
## Channels
### Social Media
### Email
### Website
## Campaigns
### Goals
### Timeline
### Budget
## Metrics
### KPIs
### Analytics
### Reporting`,
}

// Define all available themes
export const allThemes: MindMapTheme[] = [
  {
    name: "original",
    displayName: "Original",
    background: "#ffffff",
    color: "#333333",
    nodeColors: {
      root: "#4f4f4f",
      level1: ["#5c7cfa", "#51cf66", "#fcc419", "#ff6b6b"],
      level2: ["#748ffc", "#69db7c", "#ffda3d", "#ff8787"],
    },
    nodeStyles: {
      root: {
        background: "#4f4f4f",
        color: "#ffffff",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "8px 12px",
      },
      primary: {
        background: "#5c7cfa",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "normal",
        borderRadius: "4px",
        padding: "6px 10px",
      },
      secondary: {
        background: "#748ffc",
        color: "#ffffff",
        fontSize: "12px",
        fontWeight: "normal",
        borderRadius: "4px",
        padding: "4px 8px",
      },
    },
    lineStyle: {
      color: "#aaaaaa",
      width: "1.5px",
      dash: false,
      lineType: "straight",
    },
    arrowStyle: {
      color: "#aaaaaa",
      size: "6px",
    },
  },
  {
    name: "planner",
    displayName: "Planner",
    background: "#f8f9fa",
    color: "#333333",
    nodeColors: {
      root: "#333333",
      level1: ["#e9ecef", "#e9ecef", "#e9ecef", "#e9ecef"],
      level2: ["#f1f3f5", "#f1f3f5", "#f1f3f5", "#f1f3f5"],
    },
    nodeStyles: {
      root: {
        background: "#333333",
        color: "#ffffff",
        fontSize: "18px",
        fontWeight: "bold",
        borderRadius: "2px",
        padding: "10px 15px",
        border: "1px solid #333333",
      },
      primary: {
        background: "#ffffff",
        color: "#333333",
        fontSize: "14px",
        fontWeight: "bold",
        borderRadius: "2px",
        padding: "8px 12px",
        border: "1px solid #333333",
      },
      secondary: {
        background: "#ffffff",
        color: "#333333",
        fontSize: "12px",
        fontWeight: "normal",
        borderRadius: "2px",
        padding: "6px 10px",
        border: "1px solid #333333",
      },
    },
    lineStyle: {
      color: "#333333",
      width: "1px",
      dash: true,
      lineType: "straight",
    },
    arrowStyle: {
      color: "#333333",
      size: "6px",
    },
  },
  {
    name: "pastel",
    displayName: "Pastel",
    background: "#ffffff",
    color: "#333333",
    nodeColors: {
      root: "#a78bfa", // Purple for central node
      level1: ["#d1fae5", "#fed7aa", "#fecaca", "#ddd6fe"], // Mint green, peach, pink, light purple
      level2: ["#a7f3d0", "#fdba74", "#fca5a5", "#c4b5fd"], // Darker versions
    },
    nodeStyles: {
      root: {
        background: "#a78bfa",
        color: "#ffffff",
        fontSize: "18px",
        fontWeight: "bold",
        borderRadius: "16px",
        padding: "12px 20px",
      },
      primary: {
        background: "#d1fae5", // Will be overridden by nodeColors
        color: "#333333",
        fontSize: "14px",
        fontWeight: "bold",
        borderRadius: "12px",
        padding: "8px 16px",
      },
      secondary: {
        background: "#a7f3d0", // Will be overridden by nodeColors
        color: "#333333",
        fontSize: "12px",
        fontWeight: "normal",
        borderRadius: "16px", // More rounded for secondary nodes
        padding: "6px 12px",
      },
    },
    lineStyle: {
      color: "#333333",
      width: "2px",
      dash: false,
      lineType: "curved",
    },
    arrowStyle: {
      color: "#333333",
      size: "8px",
    },
  },
  {
    name: "creative",
    displayName: "Creative Pink",
    background: "#fff5f7",
    color: "#ffffff",
    nodeColors: {
      root: "#ffffff",
      level1: ["#f8a5c2", "#f8a5c2", "#f8a5c2", "#f8a5c2"],
      level2: ["#f8a5c2", "#f8a5c2", "#f8a5c2", "#f8a5c2"],
    },
    nodeStyles: {
      root: {
        background: "#ffffff",
        color: "#f06595",
        fontSize: "22px",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "15px 20px",
        border: "3px solid #f8a5c2",
        boxShadow: "3px 3px 0 #f8a5c2",
      },
      primary: {
        background: "#f8a5c2",
        color: "#ffffff",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "0px",
        padding: "10px 20px",
        border: "none",
        boxShadow: "none",
      },
      secondary: {
        background: "#f8a5c2",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "normal",
        borderRadius: "0px",
        padding: "8px 16px",
        border: "none",
        boxShadow: "none",
      },
    },
    lineStyle: {
      color: "#f06595",
      width: "3px",
      dash: false,
      lineType: "curved",
    },
    arrowStyle: {
      color: "#f06595",
      size: "10px",
    },
  },
  {
    name: "strategy",
    displayName: "Strategy",
    background: "#ffffff",
    color: "#333333",
    nodeColors: {
      root: "#e7f5ff",
      level1: ["#e7f5ff", "#e7f5ff", "#e7f5ff", "#e7f5ff"],
      level2: ["#e7f5ff", "#e7f5ff", "#e7f5ff", "#e7f5ff"],
    },
    nodeStyles: {
      root: {
        background: "#e7f5ff",
        color: "#1c7ed6",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "10px 15px",
        border: "1px solid #1c7ed6",
      },
      primary: {
        background: "#ffffff",
        color: "#333333",
        fontSize: "14px",
        fontWeight: "normal",
        borderRadius: "4px",
        padding: "8px 12px",
        border: "1px solid #1c7ed6",
      },
      secondary: {
        background: "#ffffff",
        color: "#333333",
        fontSize: "12px",
        fontWeight: "normal",
        borderRadius: "4px",
        padding: "6px 10px",
        border: "1px solid #1c7ed6",
      },
    },
    lineStyle: {
      color: "#1c7ed6",
      width: "1px",
      dash: true,
      lineType: "straight",
    },
    arrowStyle: {
      color: "#1c7ed6",
      size: "6px",
    },
  },
]

// Function to apply theme to a node
export function applyThemeToNode(node: HTMLElement, theme: MindMapTheme, level: number, index: number): void {
  if (!node) return

  // Get the appropriate style based on level
  const styleObj =
    level === 0 ? theme.nodeStyles.root : level === 1 ? theme.nodeStyles.primary : theme.nodeStyles.secondary

  // Get color based on level and index
  let background = styleObj.background

  if (level === 0 && theme.nodeColors?.root) {
    background = theme.nodeColors.root
  } else if (level === 1 && theme.nodeColors?.level1) {
    background = theme.nodeColors.level1[index % theme.nodeColors.level1.length]
  } else if (level >= 2 && theme.nodeColors?.level2) {
    background = theme.nodeColors.level2[index % theme.nodeColors.level2.length]
  }

  // Apply styles
  node.style.background = background
  node.style.color = styleObj.color || theme.color
  node.style.fontSize = styleObj.fontSize
  node.style.fontWeight = styleObj.fontWeight
  node.style.borderRadius = styleObj.borderRadius
  node.style.padding = styleObj.padding

  // Apply optional styles if they exist
  if (styleObj.border) node.style.border = styleObj.border
  if (styleObj.boxShadow) node.style.boxShadow = styleObj.boxShadow

  // Set data attributes for CSS targeting
  node.setAttribute("data-level", level.toString())
  node.setAttribute("data-theme", theme.name)

  // For pastel theme, determine if node should be oval
  if (theme.name === "pastel" && level > 0) {
    const topic = node.querySelector(".topic")?.textContent || ""
    const isShort = topic.length < 10

    if (isShort) {
      node.style.borderRadius = "50px"
      node.setAttribute("data-shape", "oval")
    } else {
      node.setAttribute("data-shape", "rectangle")
    }
  }
}

// Function to customize the connection lines
export function customizeLines(container: HTMLElement, theme: MindMapTheme): void {
  if (!container) return

  // Select all SVG paths (connection lines)
  const paths = container.querySelectorAll("svg path")

  paths.forEach((path) => {
    // Set line color and width
    path.setAttribute("stroke", theme.lineStyle.color)
    path.setAttribute("stroke-width", theme.lineStyle.width)

    // Apply dashed style if specified
    if (theme.lineStyle.dash) {
      path.setAttribute("stroke-dasharray", "5,5")
    } else {
      path.removeAttribute("stroke-dasharray")
    }

    // Make lines curved if specified
    if (theme.lineStyle.lineType === "curved") {
      const d = path.getAttribute("d")
      if (d && !d.includes("C") && !d.includes("Q")) {
        // This is a simple approach - for production, you'd want a more sophisticated
        // algorithm to create proper bezier curves
        const points = d.split(/[ML]/g).filter(Boolean)
        if (points.length >= 2) {
          const start = points[0].trim().split(",").map(Number)
          const end = points[points.length - 1].trim().split(",").map(Number)

          // Create a control point for the bezier curve
          const controlX = (start[0] + end[0]) / 2
          const controlY = (start[1] + end[1]) / 2

          // Create a new curved path
          const newPath = `M${start[0]},${start[1]} Q${controlX},${controlY} ${end[0]},${end[1]}`
          path.setAttribute("d", newPath)
        }
      }
    }
  })

  // Add arrows to the lines if theme has arrow style
  if (theme.arrowStyle) {
    const arrows = container.querySelectorAll(".arrow")
    arrows.forEach((arrow) => {
      if (theme.arrowStyle) {
        arrow.setAttribute("fill", theme.arrowStyle.color)
        arrow.setAttribute("width", theme.arrowStyle.size)
        arrow.setAttribute("height", theme.arrowStyle.size)
      }
    })
  }
}

