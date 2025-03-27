"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  File,
  Trash2,
  Plus,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { documentAPI } from "@/lib/api";

interface FileItem {
  id: string;
  name: string;
  selected: boolean;
  type: string;
  url: string;
  size: number;
  cloudinaryId: string;
  FilePath: string;
}

interface Folder {
  id: string;
  name: string;
  files: FileItem[];
  folders: Folder[];
  selected: boolean;
  expanded: boolean;
}

type DragItem =
  | {
      type: "file";
      item: FileItem;
      parentId: string | null;
    }
  | {
      type: "folder";
      item: Folder;
      parentId: string | null;
    };

interface FileCollectionProps {
  onFileSelect: (files: FileItem[]) => void;
}

interface ChatItem {
  id: string;
  name: string;
  messages: string[];
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const validateFileSize = (file: File): string | null => {
  if (file.type.startsWith("image/") && file.size > MAX_IMAGE_SIZE) {
    return `Image "${file.name}" exceeds the maximum size of 10MB!`;
  }
  if (file.type.startsWith("video/") && file.size > MAX_VIDEO_SIZE) {
    return `Video "${file.name}" exceeds the maximum size of 100MB!`;
  }
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" exceeds the maximum size of 100MB!`;
  }
  return null;
};

export function FileCollection({ onFileSelect }: FileCollectionProps) {
  const [userID, setUserID] = useState("User");

  // Helper function to determine file type from name
const getFileTypeFromName = (filename: string): string => {
  if (!filename) return "document";
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (!extension) return "document";
  
  if (['pdf'].includes(extension)) return "application/pdf";
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) return "image/" + extension;
  if (['mp4', 'webm', 'mov'].includes(extension)) return "video/" + extension;
  if (['md', 'markdown'].includes(extension)) return "text/markdown";
  
  return "document";
};

const getFileExtension = (filename: string): string => {
  if (!filename) return "";
  
  // Get the last part after the dot
  const extensionMatch = filename.match(/\.[^.]+$/);
  
  // Return the extension with the dot, or empty string if no extension
  return extensionMatch ? extensionMatch[0].toLowerCase() : "";
};


const handleDisplayUserFiles = useCallback(async (userId: string) => {
  try {
    // Call the API to get all documents for this user
    console.log("Loading documents for user:", userId);
    const documents = await documentAPI.getDocuments(userId);

    if (!documents || documents.length === 0) {
      console.log("No documents found for user");
      return;
    }

    console.log("Documents loaded:", documents.length);

    // Group documents by filepath to create folder structure
    const filesByPath: Record<string, any[]> = {};

    documents.forEach((doc: { document_id: string; document_name: string; document_path: string }) => {
      const path = doc.document_path || "root";
      
      // Check path validity
      console.log(`Document ${doc.document_id} has path: ${path}`);
      
      if (!filesByPath[path]) {
        filesByPath[path] = [];
      }
      filesByPath[path].push(doc);
    });

    // Start with empty root files and folders
    const newRootFiles: FileItem[] = [];
    const newRootFolders: Folder[] = [];
    
    // Add files directly in the root
    if (filesByPath["root"]) {
      filesByPath["root"].forEach((doc) => {

       
        const cloudinaryURL = `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${doc.document_id}${getFileExtension(doc.document_name)}`;
        console.log("Cloudinary URL:", cloudinaryURL);
        
        // Determine file type based on name
        const fileType = doc.document_name ? getFileTypeFromName(doc.document_name) : "document";
        
        newRootFiles.push({
          id: doc.document_id,
          name: doc.document_name || "Untitled Document",
          selected: false,
          type: fileType,
          url: cloudinaryURL,  // Set the URL for preview
          size: 0,
          cloudinaryId: doc.document_id,
          FilePath: "root"
        });
      });
    }
    
    // Process each path to create folder structure
    Object.keys(filesByPath).forEach((path) => {
      if (path === "root") return;
      
      const pathParts = path.split("/").filter(p => p !== "root");
      if (pathParts.length === 0) return;
      
      let currentFolders = newRootFolders;
      let folder = null;
      
      // Traverse the path to create folders
      pathParts.forEach((folderName, index) => {
        folder = currentFolders.find(f => f.name === folderName);
        
        if (!folder) {
          folder = {
            id: Math.random().toString(36).substr(2, 9),
            name: folderName,
            files: [],
            folders: [],
            selected: false,
            expanded: true,
          };
          currentFolders.push(folder);
        }
        
        // Add files to the last folder
        if (index === pathParts.length - 1) {
          folder.files.push(
            ...filesByPath[path].map((doc) => {
              // Generate URL for Cloudinary resource
              const cloudinaryURL = `https://res.cloudinary.com/df4dk9tjq/image/upload/v1743076103/${doc.document_id}`;
              
              // Determine file type based on name
              const fileType = doc.document_name ? getFileTypeFromName(doc.document_name) : "document";
              
              return {
                id: doc.document_id,
                name: doc.document_name || "Untitled Document",
                selected: false,
                type: fileType,
                url: cloudinaryURL,  // Set the URL for preview
                size: 0,
                cloudinaryId: doc.document_id,
                FilePath: path,
              };
            })
          );
        }
        
        // Update the current folders
        currentFolders = folder.folders;
      });
    });

    console.log("Setting state with files:", newRootFiles.length, "and folders:", newRootFolders.length);
    
    // Update the state
    setRootFiles(newRootFiles);
    setRootFolders(newRootFolders);
  } catch (error) {
    console.error("Error displaying user files:", error);
  }
}, []);

  useEffect(() => {
    const storedUserID = localStorage.getItem("user_id");
    if (storedUserID) {
      setUserID(storedUserID);
      handleDisplayUserFiles(storedUserID);
    }
  }, [handleDisplayUserFiles]);

  const [rootFiles, setRootFiles] = useState<FileItem[]>([]);
  const [rootFolders, setRootFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState<
    boolean | string
  >(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [chatboxes, setChatboxes] = useState<ChatItem[]>([]);
  const [showNewChatInput, setShowNewChatInput] = useState<boolean>(false);
  const [newChatName, setNewChatName] = useState("");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  // Function to get file path based on folder hierarchy
const getFilePath = useCallback(
  (folderId?: string): string => {
    if (!folderId) {
      return "root";
    }

    // Helper function to find path to a specific folder
    const findFolderPath = (
      folders: Folder[],
      targetId: string,
      currentPath: string = "root"
    ): string | null => {
      for (const folder of folders) {
        if (folder.id === targetId) {
          return currentPath + "/" + folder.name;
        }

        // Check in subfolders
        const path = findFolderPath(
          folder.folders,
          targetId,
          currentPath + "/" + folder.name
        );
        if (path) return path;
      }
      return null;
    };

    const path = findFolderPath(rootFolders, folderId);
    return path || "root";
  },
  [rootFolders]
);

  const handleUpload = async (
    file: File,
    documentId: string
  ): Promise<FileItem | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_id", documentId);

    try {
      const response = await fetch("http://localhost:5000/user/upload", {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error("Upload failed:", responseText);
        throw new Error(`Upload failed: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log("Uploaded:", data);

      return {
        id: data.document_id,
        name: file.name,
        selected: false,
        type: file.type,
        url: data.url,
        size: file.size,
        cloudinaryId: data.document_id,
        FilePath: data.file_path,
      };
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const handleFileUpload = useCallback(
    async (
      event: React.ChangeEvent<HTMLInputElement>,
      userID: string,
      folderId?: string
    ) => {
      const uploadedFiles = event.target.files;
      if (!uploadedFiles) return;
  
      const invalidFiles: string[] = [];
      const validFilesArray: File[] = [];
  
      Array.from(uploadedFiles).forEach((file) => {
        const error = validateFileSize(file);
        if (error) {
          invalidFiles.push(error);
        } else {
          validFilesArray.push(file);
        }
      });
  
      if (invalidFiles.length > 0) {
        alert(invalidFiles.join("\n"));
        return;
      }
  
      // Generate the file path for this upload
      const filePath = getFilePath(folderId);
      console.log("Uploading to path:", filePath);
  
      const newFiles = await Promise.all(
        validFilesArray.map(async (file) => {
          try {
            // Pass the filePath to createDocument
            const response = await documentAPI.createDocument(
              userID,
              file.name,
              filePath,
            );

            if (!response || !response.document_id) {
              throw new Error("Failed to generate document ID");
            }
  
            const documentId = response.document_id;
            console.log("Document ID:", documentId, "with path:", response.document_path);
  
            const uploadedFile = await handleUpload(file, documentId);
            
            // Make sure FilePath is included in the file item
            if (uploadedFile) {
              uploadedFile.FilePath = response.document_path || filePath;
              console.log("Final file with path:", uploadedFile.FilePath);
            }
            
            return uploadedFile;
          } catch (error) {
            console.error("Error uploading file:", error);
            return null;
          }
        })
      );
  
      const validFiles: FileItem[] = newFiles.filter(
        (file): file is FileItem => file !== null
      );
  
      if (validFiles.length === 0) {
        console.warn("No valid files were uploaded!!!");
        return;
      }
  
      // Update UI state
      if (folderId) {
        setRootFolders((prevFolders) =>
          updateFolderContents(prevFolders, folderId, (folder) => ({
            ...folder,
            files: [...folder.files, ...validFiles],
          }))
        );
      } else {
        setRootFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [getFilePath]
  );

  const createFolder = useCallback(
    (parentId?: string) => {
      if (newFolderName.trim()) {
        const newFolder: Folder = {
          id: Math.random().toString(36).substr(2, 9),
          name: newFolderName,
          files: [],
          folders: [],
          selected: false,
          expanded: false,
        };
        if (parentId) {
          setRootFolders((prevFolders) => {
            return updateFolderContents(prevFolders, parentId, (folder) => ({
              ...folder,
              folders: [...folder.folders, newFolder],
            }));
          });
        } else {
          setRootFolders((prev) => [...prev, newFolder]);
        }
        setNewFolderName("");
        setShowNewFolderInput(false);
      }
    },
    [newFolderName]
  );

  const updateFolderContents = useCallback(
    (
      folders: Folder[],
      folderId: string,
      updateFn: (folder: Folder) => Folder
    ): Folder[] => {
      return folders.map((folder) => {
        if (folder.id === folderId) {
          return updateFn(folder);
        }
        return {
          ...folder,
          folders: updateFolderContents(folder.folders, folderId, updateFn),
        };
      });
    },
    []
  );

  const toggleFolder = useCallback(
    (folderId: string) => {
      setRootFolders((prevFolders) => {
        return updateFolderContents(prevFolders, folderId, (folder) => ({
          ...folder,
          expanded: !folder.expanded,
        }));
      });
    },
    [updateFolderContents]
  );

  const toggleFolderSelection = useCallback(
    (folderId: string) => {
      setRootFolders((prevFolders) => {
        return updateFolderContents(prevFolders, folderId, (folder) => ({
          ...folder,
          selected: !folder.selected,
          files: folder.files.map((file) => ({
            ...file,
            selected: !folder.selected,
          })),
          folders: folder.folders.map((subFolder) => ({
            ...subFolder,
            selected: !folder.selected,
          })),
        }));
      });
    },
    [updateFolderContents]
  );

  const toggleFileSelection = useCallback(
    (fileId: string, folderId?: string) => {
      if (folderId) {
        setRootFolders((prevFolders) => {
          return updateFolderContents(prevFolders, folderId, (folder) => ({
            ...folder,
            files: folder.files.map((file) =>
              file.id === fileId ? { ...file, selected: !file.selected } : file
            ),
          }));
        });
      } else {
        setRootFiles((files) =>
          files.map((file) =>
            file.id === fileId ? { ...file, selected: !file.selected } : file
          )
        );
      }
    },
    [updateFolderContents]
  );

  const deleteFile = useCallback(
    async (fileId: string, folderId?: string) => {
      try {
        const response = await fetch("http://localhost:5000/user/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ document_id: fileId }),
        });

        const data = await response.json();
        const dbDelete = await documentAPI.deleteDocument(data.document_id);

        if (folderId) {
          setRootFolders((prevFolders) =>
            updateFolderContents(prevFolders, folderId, (folder) => ({
              ...folder,
              files: folder.files.filter((file) => file.id !== fileId),
            }))
          );
        } else {
          setRootFiles((files) => files.filter((file) => file.id !== fileId));
        }
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },
    [updateFolderContents]
  );

  const deleteFolder = useCallback(
    (folderId: string, parentId?: string) => {
      if (parentId) {
        setRootFolders((prevFolders) => {
          return updateFolderContents(prevFolders, parentId, (folder) => ({
            ...folder,
            folders: folder.folders.filter((f) => f.id !== folderId),
          }));
        });
      } else {
        setRootFolders((folders) => folders.filter((f) => f.id !== folderId));
      }
    },
    [updateFolderContents]
  );

  const handleDragStart = (
    e: React.DragEvent,
    item: FileItem | Folder,
    type: "file" | "folder",
    parentId: string | null
  ) => {
    e.stopPropagation();
    setDraggedItem({ type, item, parentId } as DragItem);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetFolderId?: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (!draggedItem) return;

      // Prevent dropping a folder into itself or its descendants
      if (
        draggedItem.type === "folder" &&
        isDescendant(draggedItem.item as Folder, targetFolderId)
      ) {
        return;
      }

      // Remove from source
      if (draggedItem.parentId) {
        setRootFolders((prevFolders) => {
          return updateFolderContents(
            prevFolders,
            draggedItem.parentId!,
            (folder) => ({
              ...folder,
              files: folder.files.filter((f) => f.id !== draggedItem.item.id),
              folders: folder.folders.filter(
                (f) => f.id !== draggedItem.item.id
              ),
            })
          );
        });
      } else {
        if (draggedItem.type === "file") {
          setRootFiles((files) =>
            files.filter((f) => f.id !== draggedItem.item.id)
          );
        } else {
          setRootFolders((folders) =>
            folders.filter((f) => f.id !== draggedItem.item.id)
          );
        }
      }

      // Add to target
      if (targetFolderId) {
        setRootFolders((prevFolders) => {
          return updateFolderContents(
            prevFolders,
            targetFolderId,
            (folder) => ({
              ...folder,
              files:
                draggedItem.type === "file"
                  ? [...folder.files, draggedItem.item as FileItem]
                  : folder.files,
              folders:
                draggedItem.type === "folder"
                  ? [...folder.folders, draggedItem.item as Folder]
                  : folder.folders,
            })
          );
        });
      } else {
        // Drop to root level
        if (draggedItem.type === "file") {
          setRootFiles((prev) => [...prev, draggedItem.item as FileItem]);
        } else {
          setRootFolders((prev) => [...prev, draggedItem.item as Folder]);
        }
      }

      setDraggedItem(null);
    },
    [draggedItem, updateFolderContents]
  );

  const isDescendant = (folder: Folder, targetId?: string): boolean => {
    if (!targetId) return false;
    if (folder.id === targetId) return true;
    return folder.folders.some((f) => isDescendant(f, targetId));
  };

  const renderFolder = (folder: Folder, parentId: string | null = null) => (
    <div
      key={folder.id}
      className="space-y-1"
      draggable
      onDragStart={(e) => handleDragStart(e, folder, "folder", parentId)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, folder.id)}
    >
      <div className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1">
        <button
          onClick={() => toggleFolder(folder.id)}
          className="text-gray-500"
        >
          {folder.expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <Checkbox
          checked={folder.selected}
          onCheckedChange={() => toggleFolderSelection(folder.id)}
        />
        <span className="text-sm truncate flex-grow">{folder.name}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background">
            <DropdownMenuItem onSelect={() => setShowNewFolderInput(folder.id)}>
              Add Subfolder
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                document.getElementById(`file-upload-${folder.id}`)?.click()
              }
            >
              Add File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => deleteFolder(folder.id, parentId || undefined)}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>

      {folder.expanded && (
        <div className="ml-6 space-y-1">
          {folder.folders.map((subFolder) =>
            renderFolder(subFolder, folder.id)
          )}
          {folder.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1"
              draggable
              onDragStart={(e) => handleDragStart(e, file, "file", folder.id)}
            >
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <Checkbox
                checked={file.selected}
                onCheckedChange={() => toggleFileSelection(file.id, folder.id)}
              />
              <span className="text-sm truncate flex-grow">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => deleteFile(file.id, folder.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          <input
            id={`file-upload-${folder.id}`}
            type="file"
            className="hidden"
            multiple
            onChange={(e) => handleFileUpload(e, userID, folder.id)}
          />
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const allSelectedFiles = [
      ...rootFiles.filter((file) => file.selected),
      ...rootFolders.flatMap((folder) => getAllSelectedFiles(folder)),
    ];
    onFileSelect(allSelectedFiles); // Pass the full array
  }, [rootFiles, rootFolders, onFileSelect]);

  const getAllSelectedFiles = (folder: Folder): FileItem[] => {
    return [
      ...folder.files.filter((file) => file.selected),
      ...folder.folders.flatMap((subFolder) => getAllSelectedFiles(subFolder)),
    ];
  };

  const createNewChat = () => {
    const newChatbox = {
      id: Math.random().toString(36).substr(2, 9),
      name: newChatName || "New Chatbox",
      messages: [],
    };
    setChatboxes((prevChatboxes) => [...prevChatboxes, newChatbox]);
    setNewChatName("");
    setShowNewChatInput(false);
  };

  const switchChatbox = (chatboxId: string) => {
    setCurrentChatId(chatboxId);
    const selectedChatbox = chatboxes.find(
      (chatbox) => chatbox.id === chatboxId
    );
    if (selectedChatbox) {
      setChatHistory(selectedChatbox.messages);
    }
    console.log("Switched to chatbox:", chatboxId);
  };

  const deleteChatbox = (chatboxId: string) => {
    setChatboxes((prevChatboxes) =>
      prevChatboxes.filter((chatbox) => chatbox.id !== chatboxId)
    );
    console.log("Deleted chatbox:", chatboxId);
  };

  return (
    <div className="w-64 border-r h-[calc(100vh-64px)] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between"></div>

      <div className="space-y-2">
        <Input
          placeholder="Search All"
          className="h-8 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="secondary"
          className="w-full h-8 text-sm bg-green-500 hover:bg-green-500 text-black"
        >
          <Search className="w-4 h-4 mr-2" />
          Search in File(s)
        </Button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Chat</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Plus className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background bg-white">
            <DropdownMenuItem onSelect={() => setShowNewChatInput(true)}>
              Create New Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showNewChatInput && (
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Chatbox name"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            className="h-8 text-sm"
          />
          <Button size="sm" className="h-8" onClick={() => createNewChat()}>
            Create
          </Button>
        </div>
      )}

      <div
        className="-mt-2 space-y-1 overflow-auto flex-1"
        style={{ maxHeight: "150px" }}
      >
        {chatboxes.map((chatbox) => (
          <div
            key={chatbox.id}
            className={`flex items-center gap-2 hover:bg-gray-50 rounded-md p-1 cursor-pointer ${
              currentChatId === chatbox.id ? "bg-gray-200" : ""
            }`}
            onClick={() => switchChatbox(chatbox.id)}
          >
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-sm truncate flex-grow">{chatbox.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => deleteChatbox(chatbox.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-2 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-medium">File Collection</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background bg-white">
              <DropdownMenuItem onSelect={() => setShowNewFolderInput(true)}>
                Add Folder
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  document.getElementById("root-file-upload")?.click()
                }
              >
                Add File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showNewFolderInput && (
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              className="h-8"
              onClick={() =>
                createFolder(
                  typeof showNewFolderInput === "string"
                    ? showNewFolderInput
                    : undefined
                )
              }
            >
              Create
            </Button>
          </div>
        )}

        <div
          className="space-y-1"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e)}
        >
          {rootFolders.map((folder) => renderFolder(folder))}
          {rootFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-md p-1"
              draggable
              onDragStart={(e) => handleDragStart(e, file, "file", null)}
            >
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <Checkbox
                checked={file.selected}
                onCheckedChange={() => toggleFileSelection(file.id)}
              />
              <span className="text-sm truncate flex-grow">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => deleteFile(file.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Quick Upload</h3>
        <div
          className="border-2 border-dashed rounded-lg p-4 text-center"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e)}
        >
          <p className="text-sm text-muted-foreground">Drop File Here</p>
          <p className="text-sm text-muted-foreground">- or -</p>
          <label className="cursor-pointer text-sm text-primary hover:underline">
            Click to Upload
            <input
              id="root-file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={(e) => handleFileUpload(e, userID)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
