"use client"

import React, { useEffect, useRef, useState } from 'react'
import MindElixir from 'mind-elixir'

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
`;

// ----------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------

declare global {
  interface HTMLDivElement {
    _mindElixirInstance?: MindElixirInstance;
  }
}

interface MindElixirInstance {
  init: (data?: any) => void;
  destroy?: () => void;
}

interface MindMapViewProps {
  markdownContent?: string;
  className?: string;
}

type TopicNode = {
  topic: string;
  id: string;
  children?: TopicNode[];
};

interface MindElixirData {
  nodeData: {
    id: string;
    topic: string;
    children?: any[];
    [key: string]: any;
  };
  linkData?: any;
}

// ----------------------------------------------------------------
// COMPONENT IMPLEMENTATION
// ----------------------------------------------------------------

export function MindMapView({ markdownContent, className }: MindMapViewProps) {
  // State and refs
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  // Generate unique ID for mind map nodes
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  /**
   * Convert markdown to mind map data structure
   */
  const parseMarkdownToMindMap = (markdown: string): MindElixirData => {
    // if (!markdown) {
    //   return {
    //     nodeData: {
    //       id: 'root', 
    //       topic: 'Empty Map',
    //       children: []
    //     }
    //   }
    // }

    if (!markdown || markdown.trim() === "") {
      markdown = DEFAULT_MARKDOWN;
    }

    try {
      // Split markdown into lines
      const lines = markdown.split('\n')
      
      // Find root topic from first level-1 heading
      const rootTopic = lines.find(line => line.trim().startsWith('# '))?.replace('# ', '') || 'Mind Map'

      // Create root node
      const rootNode: TopicNode = {
        id: 'root',
        topic: rootTopic,
        children: []
      };

      // Track hierarchy state
      let currentLevel = 0
      let currentParentStack: TopicNode[] = [rootNode]

      // Process each line
      lines.forEach((line) => {
        const trimmedLine = line.trim()
        if (!trimmedLine || trimmedLine.startsWith('# ')) return

        // Check for headings level 2-6
        const match = trimmedLine.match(/^(#{2,6})\s+(.+)$/)
        if (match) {
          const level = match[1].length - 1
          const topic = match[2]

          // Adjust the stack to match the current heading level
          while (currentLevel >= level && currentParentStack.length > 1) {
            currentParentStack.pop()
            currentLevel--
          }

          // Create new node
          const newNode: TopicNode = {
            id: generateId(),
            topic,
            children: []
          }

          // Add to parent
          const currentParent = currentParentStack[currentParentStack.length - 1]
          if (!currentParent.children) {
            currentParent.children = []
          }
          currentParent.children.push(newNode)

          // Update stack
          currentParentStack.push(newNode)
          currentLevel = level
        }
      })

      return {
        nodeData: rootNode as any
      }
    } catch (err) {
      console.error('Error parsing markdown:', err)
      setError('Failed to parse markdown content')
      return {
        nodeData: {
          id: 'error',
          topic: 'Error',
          children: []
        }
      }
    }
  }

  /**
   * Initialize mind map when markdown content changes
   */
  useEffect(() => {
    // Skip if prerequisites aren't met
    if (!containerRef.current || !markdownContent) {
      return;
    }
  
    const container = containerRef.current;
    
    try {
    
      // Clean up previous instance if it exists
      if (container._mindElixirInstance) {
        try {
          if (container._mindElixirInstance.destroy) {
            const instance = container._mindElixirInstance;
            setTimeout(() => {
              try {
                instance.destroy && instance.destroy();
              } catch (e) {
                console.error("Delayed destroy failed:", e);
              }
            }, 0);
          }
        } catch (e) {
          console.error("Error destroying old instance:", e);
        }
        delete container._mindElixirInstance;
      }

      // Clear container before initializing
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Parse markdown to mind map structure
      const parsedData = parseMarkdownToMindMap(markdownContent);
      
      // Configure MindElixir
      const options = {
        el: container,
        direction: 2, // RIGHT
        draggable: true,
        contextMenu: true,
        toolBar: true,
        nodeMenu: true,
        keypress: true,
      };
      
      // Initialize MindElixir
      const me = new MindElixir(options) as MindElixirInstance;
      container._mindElixirInstance = me;
      me.init(parsedData as any);
      
      // Cleanup on unmount
      return () => {
        if (!container) return; // Skip if container is already removed
        try {
          const instance = container._mindElixirInstance;
          if (instance) {
            // Sử dụng biến tạm thời, làm giảm rủi ro lỗi tham chiếu
            delete container._mindElixirInstance;
            
            // Đặt destroy trong timeout để tránh lỗi
            setTimeout(() => {
              try {
                instance.destroy && instance.destroy();
              } catch (e) {
                console.error("Cleanup destroy error:", e);
              }
            }, 0);
          }
        } catch (e) {
          console.error("Error during cleanup:", e);
        }
      };
    } catch (err) {
      console.error('Error initializing mind map:', err);
      setError(`Failed to initialize mind map: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [markdownContent]);
  

  // Render component
  return (
    <div className={`w-full h-full ${className || ''}`}>
      {error ? (
        <div className="p-4 text-red-500">
          <div>Error: {error}</div>
        </div>
      ) : (
        <div 
          ref={containerRef} 
          className="w-full h-full border border-gray-200 rounded map-container"
          style={{ 
            position: 'relative',
            overflow: 'hidden',
            maxHeight: '80vh'
          }}
        ></div>
      )}
    </div>
  );
}