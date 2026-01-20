import React from "react";
import { Navbar, Sidebar } from "../../components/layout";
import styles from "./HelpPage.module.css";

export default function HelpPage() {
    return (
        <div className={styles.helpLayout}>
            <Navbar />
            <div className={styles.helpContent}>
                <Sidebar />
                
                <div className={styles.helpMain}>
                    <h1>Help & FAQ</h1>
                    
                    <div className={styles.helpSection}>
                        <h2>Getting Started</h2>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I create my first project?</h3>
                            <p>
                                Navigate to "Create new Group" from the menu or click the "+" button in the projects section. 
                                Fill out your project details including name, description, and tags. You can also set whether 
                                your project is public or private, and define the skills you're looking for in collaborators.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I find people to collaborate with?</h3>
                            <p>
                                Use the "Find Friends" section to discover users with similar interests and skills. 
                                You can also browse public projects and connect with their creators. Make sure to 
                                fill out your Skills & Interests profile to help others find you too!
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I join an existing project?</h3>
                            <p>
                                Browse the Projects page to see public projects that interest you. Click on a project 
                                to view its details, then use the contact options to reach out to the project creator 
                                or team members. Some projects may have open invitations you can accept directly.
                            </p>
                        </div>
                    </div>
                    
                    <div className={styles.helpSection}>
                        <h2>Projects & Collaboration</h2>
                        
                        <div className={styles.faqItem}>
                            <h3>What's the difference between public and private projects?</h3>
                            <p>
                                <strong>Public projects</strong> are visible to everyone and can be discovered through search. 
                                Anyone can view the project details and posts.<br/>
                                <strong>Private projects</strong> are only visible to invited members and project creators.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I invite people to my project?</h3>
                            <p>
                                From your project page, look for the "Invite Members" or "Manage Team" option. 
                                You can send invitations by username or email. Invited users will receive notifications 
                                and can accept or decline your invitation.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I use the project workspace/chat?</h3>
                            <p>
                                Each project has a dedicated workspace where team members can communicate, share updates, 
                                and collaborate. Access it through the "Workspace" tab in your project. You can share 
                                files, discuss ideas, and track progress all in one place.
                            </p>
                        </div>
                    </div>
                    
                    <div className={styles.helpSection}>
                        <h2>Profile & Settings</h2>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I add my skills and interests?</h3>
                            <p>
                                Go to "My Skills & Interests" from the menu or your profile. Add relevant skills, 
                                technologies, and interests that represent your expertise and what you're passionate about. 
                                This helps other users find you for collaboration opportunities.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I customize my profile?</h3>
                            <p>
                                Click on your profile picture or go to "Edit Profile" to update your information, 
                                upload a profile picture, add a banner image, and write an "About Me" section that showcases your 
                                background and interests.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I change my theme or display settings?</h3>
                            <p>
                                Visit the Settings page from the menu to customize your experience. You can switch 
                                between dark and light themes, adjust font sizes, and modify other display preferences 
                                to suit your needs.
                            </p>
                        </div>
                    </div>
                    
                    <div className={styles.helpSection}>
                        <h2>Posts & Communication</h2>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I create and share posts?</h3>
                            <p>
                                Use the "New Post" button to create updates about your projects, share achievements, 
                                or ask for help. You can add images, tag relevant skills, and choose whether to post 
                                to your profile or a specific project.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I save posts for later?</h3>
                            <p>
                                Click the bookmark icon on any post to save it to your "Saved" collection. 
                                Access your saved posts anytime from the Saved page in the menu.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I start a private conversation?</h3>
                            <p>
                                Click on any user's profile and select "Send Message" or "Chat" to start a private 
                                conversation. You can also access all your conversations from the "Chats" page.
                            </p>
                        </div>
                    </div>
                    
                    <div className={styles.helpSection}>
                        <h2>Privacy & Safety</h2>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I report inappropriate content?</h3>
                            <p>
                                Use the report button (usually three dots menu) on any post or message that violates 
                                community guidelines. Our moderation team will review reports and take appropriate action.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>How do I block someone?</h3>
                            <p>
                                Visit the user's profile and select "Block User" from the options menu. 
                                Blocked users won't be able to message you or see your content. You can manage 
                                blocked users from your Settings.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>Is my personal information safe?</h3>
                            <p>
                                We take privacy seriously. Your email and personal details are never shared publicly. 
                                You control what information appears on your profile, and you can adjust privacy 
                                settings for your projects and posts.
                            </p>
                        </div>
                    </div>
                    
                    <div className={styles.helpSection}>
                        <h2>Troubleshooting</h2>

                        <div className={styles.faqItem}>
                            <h3>I want to change my password</h3>
                            <p>
                                Use the "change Password" link in the settings page to reset your password.
                            </p>
                        </div>
                        
                        <div className={styles.faqItem}>
                            <h3>The app is running slowly or not working properly</h3>
                            <p>
                                Try refreshing the page or clearing your browser cache. Make sure you're using 
                                a supported browser (Chrome, Firefox, Safari, Edge). If problems persist, 
                                try logging out and back in.
                            </p>
                        </div>
                    </div>
                    
                    <div className={styles.helpSection}>
                        <h2>Still Need Help?</h2>
                        <p>
                            If you can't find the answer to your question here, don't hesitate to reach out! 
                            You can contact our support team or ask the community for help.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}