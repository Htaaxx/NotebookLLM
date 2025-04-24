// Define the available languages
export type Language = "en" | "vi"

// Define the translation keys structure
export interface Translations {
  // Navigation
  CHATBOX: string
  FILES: string
  FLASHCARD: string
  Profile: string

  // User menu
  Language: string
  SignOut: string

  // File collection
  searchAll: string
  searchInFiles: string
  chat: string
  createNewChat: string
  fileCollection: string
  addFolder: string
  addFile: string
  create: string
  quickUpload: string
  dropFileHere: string
  clickToUpload: string

  // Chat
  chatSettings: string
  typeMessage: string
  send: string
  regenerate: string
  disclaimer: string
  recallActiveMode: string
  recallSessionEnded: string

  // Right panel
  noChosenFile: string

  // File page
  uploadFiles: string
  dragAndDrop: string
  chooseFiles: string
  toUpload: string
  supportedFiles: string
  googleDrive: string
  importFromDrive: string
  youtube: string
  importFromYoutube: string
  copyAndPasteText: string
  pasteText: string
  words: string
  saveText: string

  // Flashcard page
  noFlashcards: string
  card: string
  of: string
  createNewFlashcard: string
  frontOfCard: string
  backOfCard: string
  addCard: string

  // Profile page
  profileSettings: string
  personalInfo: string
  changePassword: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  saveChanges: string

  // Mindmap and Cheatsheet
  noContentAvailable: string
  selectFilesToGenerate: string
  mindmap: string
  cheatsheet: string
  preview: string
  fullscreen: string
  exitFullscreen: string
  exportToPDF: string
  print: string
  loading: string
  zoomIn: string
  zoomOut: string
  nextPage: string
  previousPage: string
  pageOf: string

  // URL Context
  urlContext: string
  enterUrl: string
  addUrl: string
  useAsContext: string
  mindMapPaths: string
}

// Define the translations
export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    CHATBOX: "CHATBOX",
    FILES: "FILES",
    FLASHCARD: "FLASHCARD",
    Profile: "PROFILE",

    // User menu
    Language: "Language",
    SignOut: "Sign Out",

    // File collection
    searchAll: "Search All",
    searchInFiles: "Search in File(s)",
    chat: "Chat",
    createNewChat: "Create New Chat",
    fileCollection: "File Collection",
    addFolder: "Add Folder",
    addFile: "Add File",
    create: "Create",
    quickUpload: "Quick Upload",
    dropFileHere: "Drop File Here",
    clickToUpload: "Click to Upload",

    // Chat
    chatSettings: "Chat settings",
    typeMessage: "Type your message here...",
    send: "Send",
    regenerate: "Regen",
    disclaimer: "NoteUS may provide inaccurate information. Please verify the answers you receive.",
    recallActiveMode: "Recall active mode",
    recallSessionEnded: "Recall session ended. Returning to normal chat mode.",

    // Right panel
    noChosenFile: "No chosen file",

    // File page
    uploadFiles: "Upload Files",
    dragAndDrop: "Drag and drop or",
    chooseFiles: "choose files",
    toUpload: "to upload",
    supportedFiles: "Supported files: PDF, txt, Markdown, Audio files (e.g., mp3)",
    googleDrive: "Google Drive",
    importFromDrive: "Import from Drive",
    youtube: "YouTube",
    importFromYoutube: "Import from YouTube",
    copyAndPasteText: "Copy and Paste Text",
    pasteText: "Paste your text here (up to 1000 words)",
    words: "words",
    saveText: "Save Text",

    // Flashcard page
    noFlashcards: "No flashcards yet. Create one below!",
    card: "Card",
    of: "of",
    createNewFlashcard: "Create New Flashcard",
    frontOfCard: "Front of card",
    backOfCard: "Back of card",
    addCard: "Add Card",

    // Profile page
    profileSettings: "Profile Settings",
    personalInfo: "Personal Information",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    saveChanges: "Save Changes",

    // Mindmap and Cheatsheet
    noContentAvailable: "No content available.",
    selectFilesToGenerate: "Please select files to generate a mindmap.",
    mindmap: "Mindmap",
    cheatsheet: "Cheatsheet",
    preview: "Preview",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    exportToPDF: "Export to PDF",
    print: "Print",
    loading: "Loading...",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    nextPage: "Next Page",
    previousPage: "Previous Page",
    pageOf: "Page {current} of {total}",

    // URL Context
    urlContext: "URL Context",
    enterUrl: "Enter URL (website or YouTube)",
    addUrl: "Add",
    useAsContext: "Use as context",
    mindMapPaths: "Mind Map Paths",
  },
  vi: {
    // Navigation
    CHATBOX: "HỘP CHAT",
    FILES: "TỆP",
    FLASHCARD: "THẺ GHI NHỚ",
    Profile: "HỒ SƠ",

    // User menu
    Language: "Ngôn ngữ",
    SignOut: "Đăng Xuất",

    // File collection
    searchAll: "Tìm kiếm tất cả",
    searchInFiles: "Tìm kiếm trong tệp",
    chat: "Trò chuyện",
    createNewChat: "Tạo cuộc trò chuyện mới",
    fileCollection: "Bộ sưu tập tệp",
    addFolder: "Thêm thư mục",
    addFile: "Thêm tệp",
    create: "Tạo",
    quickUpload: "Tải lên nhanh",
    dropFileHere: "Thả tệp vào đây",
    clickToUpload: "Nhấp để tải lên",

    // Chat
    chatSettings: "Cài đặt trò chuyện",
    typeMessage: "Nhập tin nhắn của bạn tại đây...",
    send: "Gửi",
    regenerate: "Tạo lại",
    disclaimer: "NoteUS có thể đưa ra thông tin không chính xác, hãy kiểm tra câu trả lời mà bạn nhận được",
    recallActiveMode: "Chế độ nhắc lại đang hoạt động",
    recallSessionEnded: "Phiên nhắc lại đã kết thúc. Quay lại chế độ trò chuyện bình thường.",

    // Right panel
    noChosenFile: "Không có tệp nào được chọn",

    // File page
    uploadFiles: "Tải lên tệp",
    dragAndDrop: "Kéo và thả hoặc",
    chooseFiles: "chọn tệp",
    toUpload: "để tải lên",
    supportedFiles: "Các tệp được hỗ trợ: PDF, txt, Markdown, tệp âm thanh (ví dụ: mp3)",
    googleDrive: "Google Drive",
    importFromDrive: "Nhập từ Drive",
    youtube: "YouTube",
    importFromYoutube: "Nhập từ YouTube",
    copyAndPasteText: "Sao chép và dán văn bản",
    pasteText: "Dán văn bản của bạn tại đây (tối đa 1000 từ)",
    words: "từ",
    saveText: "Lưu văn bản",

    // Flashcard page
    noFlashcards: "Chưa có thẻ ghi nhớ nào. Tạo một thẻ bên dưới!",
    card: "Thẻ",
    of: "của",
    createNewFlashcard: "Tạo thẻ ghi nhớ mới",
    frontOfCard: "Mặt trước của thẻ",
    backOfCard: "Mặt sau của thẻ",
    addCard: "Thêm thẻ",

    // Profile page
    profileSettings: "Cài đặt hồ sơ",
    personalInfo: "Thông tin cá nhân",
    changePassword: "Đổi mật khẩu",
    currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới",
    confirmPassword: "Xác nhận mật khẩu mới",
    saveChanges: "Lưu thay đổi",

    // Mindmap and Cheatsheet
    noContentAvailable: "Không có nội dung.",
    selectFilesToGenerate: "Vui lòng chọn tệp để tạo sơ đồ tư duy.",
    mindmap: "Sơ đồ tư duy",
    cheatsheet: "Bảng tóm tắt",
    preview: "Xem trước",
    fullscreen: "Toàn màn hình",
    exitFullscreen: "Thoát toàn màn hình",
    exportToPDF: "Xuất ra PDF",
    print: "In",
    loading: "Đang tải...",
    zoomIn: "Phóng to",
    zoomOut: "Thu nhỏ",
    nextPage: "Trang tiếp",
    previousPage: "Trang trước",
    pageOf: "Trang {current} / {total}",

    // URL Context
    urlContext: "Ngữ cảnh URL",
    enterUrl: "Nhập URL (trang web hoặc YouTube)",
    addUrl: "Thêm",
    useAsContext: "Sử dụng làm ngữ cảnh",
    mindMapPaths: "Đường dẫn sơ đồ tư duy",
  },
}
