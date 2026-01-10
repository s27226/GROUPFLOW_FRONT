/**
 * Pages Index
 * 
 * This file exports all pages for easy importing throughout the application.
 * Pages are grouped by domain/feature for better organization.
 */

// Authentication pages
export { LoginPage, RegisterPage, ResetPasswordPage } from './auth';

// Chat pages
export { ChatPage } from './chat';

// Feed pages
export { MainPage, NewPostPage, PostPage, SavedPage } from './feed';

// Friends pages
export { FriendPage } from './friends';

// Invitations pages
export { InvitationsPage } from './invitations';

// Moderation pages
export { ModerationPage, BlockedUsersPage, ReportedPostsPage } from './moderation';

// Profile pages
export { ProfilePage, ProfileEditPage, ProfileTagsPage, SettingsPage } from './profile';

// Projects pages
export { 
    ProjectsPage, 
    MyProjectsPage, 
    CreateGroupPage, 
    ProjectEditFrontPage, 
    ProjectProfilePage, 
    ProjectViewPage 
} from './projects';

// Users pages
export { UsersPage } from './users';
