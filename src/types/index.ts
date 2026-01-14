// User types
export interface User {
  id: number;
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
  id: number;
  author: string;
  authorId: number;
  authorProfilePic?: string;
  title?: string;
  content: string;
  image?: string;
  time: string;
  likes?: Like[];
  comments?: Comment[];
  sharedPost?: Post | null;
  projectId?: number;
  saved?: boolean;
  hidden?: boolean;
}

export interface Like {
  userId: number;
  userName?: string;
}

export interface Comment {
  id: number;
  userId: number;
  author: string;
  authorProfilePic?: string;
  content: string;
  time: string;
  replies?: Comment[];
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  image?: string;
  owner?: User;
  ownerId?: number;
  members?: ProjectMember[];
  createdAt?: string;
}

export interface ProjectMember {
  id: number;
  userId: number;
  user: User;
  role: string;
  joinedAt?: string;
}

// Chat types
export interface ChatMessage {
  id: number;
  text: string;
  from: string;
  sender?: User;
  self?: boolean;
  user?: string;
  avatar?: string;
  timestamp?: string;
}

export interface Chat {
  id: number;
  projectId?: number;
  participants?: User[];
  messages?: ChatMessage[];
  lastMessage?: ChatMessage;
}

export interface UserChat {
  id: number;
  recipientId: number;
  recipient: User;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// Friend types
export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  friend?: User;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt?: string;
}

// Invitation types
export interface Invitation {
  id: number;
  senderId: number;
  sender: User;
  recipientId: number;
  recipient?: User;
  projectId?: number;
  project?: Project;
  type: 'friend' | 'project';
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: string;
}

// File types
export interface ProjectFile {
  id: number;
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploadedBy?: User;
  uploadedAt?: string;
}

// Termin types
export interface Termin {
  id: number;
  title: string;
  description?: string;
  date: string;
  time?: string;
  projectId: number;
  createdBy?: User;
}

// Moderation types
export interface Report {
  id: number;
  postId: number;
  post?: Post;
  reporterId: number;
  reporter?: User;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt?: string;
}

export interface BlockedUser {
  id: number;
  userId: number;
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
  id: number;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'invitation';
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
