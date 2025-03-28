export interface FileItem {
    id: string
    name: string
    selected: boolean
    type: string
    url: string
    size: number
    cloudinaryId: string
    FilePath: string
  }
  
  export interface Folder {
    id: string
    name: string
    files: FileItem[]
    folders: Folder[]
    selected: boolean
    expanded: boolean
  }
  
  export interface ChatItem {
    id: string
    name: string
    messages: string[]
  }
  
  export type DragItem =
    | {
        type: "file"
        item: FileItem
        parentId: string | null
      }
    | {
        type: "folder"
        item: Folder
        parentId: string | null
      }
  
  