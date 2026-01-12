// User types
export interface User {
  id: string;
  name?: string;
  surname?: string;
  nickname: string;
  email?: string;
  profilePic?: string;
  profilePicUrl?: string;
  isModerator?: boolean;
  bio?: string;
  skills?: string[];
  interests?: string[];
  createdAt?: string;
}

// Post types
export interface Post {
  id: string;
  author: string;
  authorId: string;
  authorProfilePic?: string;
  title?: string;
  content: string;
  image?: string;
  time: string;
  likes?: Like[];
  comments?: Comment[];
  sharedPost?: Post | null;
  projectId?: string;
  saved?: boolean;
  hidden?: boolean;
}

export interface Like {
  userId: string;
  userName?: string;
}

export interface Comment {
  id: string;
  userId: string;
  author: string;
  authorProfilePic?: string;
  content: string;
  time: string;
  replies?: Comment[];
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  image?: string;
  owner?: User;
  ownerId?: string;
  members?: ProjectMember[];
  createdAt?: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  user: User;
  role: string;
  joinedAt?: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  text: string;
  from: string;
  sender?: User;
  self?: boolean;
  user?: string;
  avatar?: string;
  timestamp?: string;
}

export interface Chat {
  id: string;
  projectId?: string;
  participants?: User[];
  messages?: ChatMessage[];
  lastMessage?: ChatMessage;
}

export interface UserChat {
  id: string;
  recipientId: string;
  recipient: User;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// Friend types
export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  friend?: User;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt?: string;
}

// Invitation types
export interface Invitation {
  id: string;
  senderId: string;
  sender: User;
  recipientId: string;
  recipient?: User;
  projectId?: string;
  project?: Project;
  type: 'friend' | 'project';
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: string;
}

// File types
export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploadedBy?: User;
  uploadedAt?: string;
}

// Termin types
export interface Termin {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  projectId: string;
  createdBy?: User;
}

// Moderation types
export interface Report {
  id: string;
  postId: string;
  post?: Post;
  reporterId: string;
  reporter?: User;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt?: string;
}

export interface BlockedUser {
  id: string;
  userId: string;
  user: User;
  reason?: string;
  expiresAt?: string;
  suspendedUntil?: string;
  blockedAt?: string;
}

// API Response types
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  extensions?: {
    code?: string;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  surname: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Component prop types
export interface ChildrenProps {
  children: React.ReactNode;
}

// Hook return types
export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseGraphQLOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

// Notification types
export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'invitation';
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
