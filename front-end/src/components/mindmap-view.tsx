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
  markdownFilePath?: string;
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

export function MindMapView({ markdownContent, markdownFilePath, className }: MindMapViewProps) {
  // State and refs
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadedContent, setLoadedContent] = useState<string>(markdownContent || '')
  const [markdown, setMarkdown] = useState('');

  // get file markdown from public folder
  const getMarkdownFromPublic = (fileName: string) => {
    // Construct the path to the file in the public directory
    const publicPath = `/mindmaps/${fileName}`;
    console.log("Loading markdown from public path:", publicPath);
    
    return fetch(publicPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load markdown file: ${response.status}`);
        }
        return response.text();
      })
      .then(content => {
        if (!content || content.trim() === '') {
          console.warn("Empty markdown file loaded, using default");
          return DEFAULT_MARKDOWN;
        }
        return content;
      })
      .catch(error => {
        console.error("Error loading markdown from public folder:", error);
        throw error;
      });
  };

  // Load markdown content from file path
  useEffect(() => {
    getMarkdownFromPublic('input1.md')
      .then(content => setMarkdown(content))
      .catch(err => console.error(err));
  }, [markdownContent]);

  // Generate unique ID for mind map nodes
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  // Convert markdown content to MindElixir data structure
  const parseMarkdownToMindMap = (markdown: string): MindElixirData => {
    
    if (!markdown || markdown.trim() === "") {
      markdown = DEFAULT_MARKDOWN;
    }

    try {
      const lines = markdown.split('\n')
      const rootTopic = lines.find(line => line.trim().startsWith('# '))?.replace('# ', '') || 'Mind Map'
      const rootNode: TopicNode = { id: 'root', topic: rootTopic, children: [] };

      let currentLevel = 0
      let currentParentStack: TopicNode[] = [rootNode]

      lines.forEach((line) => {
        const trimmedLine = line.trim()
        if (!trimmedLine || trimmedLine.startsWith('# ')) return
        const match = trimmedLine.match(/^(#{2,6})\s+(.+)$/)
        if (match) {
          const level = match[1].length - 1
          const topic = match[2]
          while (currentLevel >= level && currentParentStack.length > 1) {
            currentParentStack.pop()
            currentLevel--
          }
          const newNode: TopicNode = { id: generateId(), topic, children: [] };
          const currentParent = currentParentStack[currentParentStack.length - 1]
          if (!currentParent.children) {currentParent.children = []}
          currentParent.children.push(newNode)
          currentParentStack.push(newNode)
          currentLevel = level
        }
      })

      return {nodeData: rootNode as any}
    } catch (err) {
      console.error('Error parsing markdown:', err)
      setError('Failed to parse markdown content')
      return {nodeData: { id: 'error', topic: 'Error', children: [] }}
    }
  }

  // Initialize MindElixir when content changes
  useEffect(() => {
    // Skip if prerequisites aren't met
    if (!containerRef.current ) return;
    const container = containerRef.current;
    const contentToUse = loadedContent || DEFAULT_MARKDOWN;

    try {
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

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Parse markdown to mind map structure
      const parsedData = parseMarkdownToMindMap(contentToUse);
      const options = {el: container, direction: 2, draggable: true, contextMenu: true, toolBar: true, nodeMenu: true, keypress: true,};
      const me = new MindElixir(options) as MindElixirInstance;
      container._mindElixirInstance = me;
      me.init(parsedData as any);
      
      return () => {
        if (!container) return; 
        try {
          const instance = container._mindElixirInstance;
          if (instance) {
            delete container._mindElixirInstance;
            
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