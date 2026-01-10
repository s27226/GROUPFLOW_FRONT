// GraphQL Queries
export const GRAPHQL_QUERIES = {
    // Posts
    GET_POSTS: `
    query GetPosts {
      post {
        allposts {
          id
          user {
            id
            nickname
            name
            surname
            profilePic
          }
          content
          title
          description
          created
          imageUrl
          likes {
            id
            userId
          }
          comments {
            id
            userId
            content
            createdAt
            user {
              id
              nickname
              name
              surname
              profilePic
            }
            likes {
              id
              userId
            }
            replies {
              id
              userId
              content
              createdAt
              user {
                id
                nickname
                name
                surname
                profilePic
              }
              likes {
                id
                userId
              }
            }
          }
          sharedPost {
            id
            user {
              id
              nickname
              name
              surname
              profilePic
            }
            content
            title
            description
            created
            imageUrl
          }
        }
      }
    }
  `,

    // Project Posts (filtered by project's group)
    GET_PROJECT_POSTS: `
    query GetProjectPosts($projectId: Int!) {
      project {
        projectposts(projectId: $projectId) {
          id
          user {
            id
            nickname
            name
            surname
            profilePic
          }
          content
          title
          description
          created
          imageUrl
          likes {
            id
            userId
          }
          comments {
            id
            userId
            content
            createdAt
            user {
              id
              nickname
              name
              surname
              profilePic
            }
            likes {
              id
              userId
            }
            replies {
              id
              userId
              content
              createdAt
              user {
                id
                nickname
                name
                surname
                profilePic
              }
              likes {
                id
                userId
              }
            }
          }
          sharedPost {
            id
            user {
              id
              nickname
              name
              surname
              profilePic
            }
            content
            title
            description
            created
            imageUrl
          }
        }
      }
    }
  `,

    // Trending Projects
    GET_TRENDING_PROJECTS: `
    query GetTrendingProjects($first: Int = 5, $after: String) {
      project {
        trendingprojects(first: $first, after: $after) {
          nodes {
            id
            name
            description
            imageUrl
            created
            owner {
              id
              nickname
              name
            }
            likes {
              id
            }
            views {
              id
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    }
  `,

    // User's Projects
    GET_MY_PROJECTS: `
    query GetMyProjects {
      project {
        myprojects {
          id
          name
          description
          imageUrl
          created
          lastUpdated
          isPublic
          owner {
            id
            nickname
            name
            surname
          }
          collaborators {
            user {
              id
              nickname
              name
              surname
            }
            role
          }
        }
      }
    }
  `,

    // User's Friends
    GET_MY_FRIENDS: `
    query GetMyFriends {
      friendship {
        myfriends {
          id
          nickname
          name
          surname
          joined
          profilePic
        }
      }
    }
  `,

    // Check friendship status with a specific user
    GET_FRIENDSHIP_STATUS: `
    query GetFriendshipStatus($friendId: Int!) {
      friendship {
        friendshipstatus(friendId: $friendId)
      }
    }
  `,

    // Blocked Users
    GET_BLOCKED_USERS: `
    query GetBlockedUsers {
      blockedUser {
        blockedusers {
          id
          nickname
          name
          surname
          profilePic
          joined
        }
      }
    }
  `,

    // Get or create direct chat with a friend (Chat with null ProjectId)
    GET_OR_CREATE_DIRECT_CHAT: `
    query GetOrCreateDirectChat($friendId: Int!) {
      chat {
        getorcreatedirectchat(friendId: $friendId) {
          id
          projectId
          userChats {
            id
            userId
            user {
              id
              nickname
              name
              surname
              profilePic
            }
          }
        }
      }
    }
  `,

    // Get all messages for a chat
    GET_CHAT_MESSAGES: `
    query GetChatMessages($chatId: Int!) {
      entry {
        chatmessages(chatId: $chatId) {
          id
          message
          sent
          public
          userChat {
            id
            userId
            user {
              id
              nickname
              name
              surname
              profilePic
            }
          }
        }
      }
    }
  `,

    // Get my UserChat ID for a specific chat
    GET_MY_USER_CHAT: `
    query GetMyUserChat($chatId: Int!) {
      userChat {
        myuserchat(chatId: $chatId) {
          id
          userId
          chatId
        }
      }
    }
  `,

    // Get all my user chats (for chat list)
    GET_MY_USER_CHATS: `
    query GetMyUserChats {
      userChat {
        myuserchats {
          id
          chat {
            id
            projectId
            userChats {
              userId
              user {
                id
                nickname
                name
                surname
                profilePic
              }
            }
          }
        }
      }
    }
  `,

    // User Profile
    GET_USER_BY_ID: `
    query GetUserById($id: Int!) {
      users {
        getuserbyid(id: $id) {
          id
          nickname
          name
          surname
          email
          joined
          dateOfBirth
          profilePic
          profilePicUrl
          bannerPic
          bannerPicUrl
        }
      }
    }
  `,

    // Get User by Nickname
    GET_USER_BY_NICKNAME: `
    query GetUserByNickname($nickname: String!) {
      users {
        userbynickname(nickname: $nickname) {
          id
          nickname
          name
          surname
          email
          joined
          dateOfBirth
          profilePic
          profilePicUrl
          bannerPic
          bannerPicUrl
        }
      }
    }
  `,

    // Current User (authenticated)
    GET_CURRENT_USER: `
    query GetCurrentUser {
      users {
        me {
          id
          nickname
          name
          surname
          email
          joined
          dateOfBirth
          profilePic
          profilePicUrl
          bannerPic
          bannerPicUrl
        }
      }
    }
  `,

    // User's Public Projects
    GET_USER_PROJECTS: `
    query GetUserProjects($userId: Int!) {
      project {
        userprojects(userId: $userId) {
          id
          name
          description
          imageUrl
          created
          owner {
            id
            nickname
            name
          }
          likes {
            id
          }
          views {
            id
          }
        }
      }
    }
  `,

    // All Projects with Pagination
    GET_ALL_PROJECTS: `
    query GetAllProjects($first: Int, $after: String, $where: ProjectFilterInput, $order: [ProjectSortInput!]) {
      project {
        allprojects(first: $first, after: $after, where: $where, order: $order) {
          nodes {
            id
            name
            description
            imageUrl
            created
            lastUpdated
            owner {
              id
              nickname
              name
            }
            likes {
              id
            }
            views {
              id
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    }
  `,

    // Project by ID
    GET_PROJECT_BY_ID: `
    query GetProjectById($id: Int!) {
      project {
        projectbyid(id: $id) {
          id
          name
          description
          imageUrl
          bannerUrl
          created
          lastUpdated
          isPublic
          owner {
            id
            nickname
            name
            surname
            profilePic
          }
          skills {
            id
            skillName
          }
          interests {
            id
            interestName
          }
          likes {
            id
          }
          views {
            id
          }
          collaborators {
            user {
              id
              nickname
              name
              surname
              profilePic
            }
            role
          }
        }
      }
    }
  `,

    // All Users
    GET_ALL_USERS: `
    query GetAllUsers($where: UserFilterInput) {
      users {
        allusers(where: $where) {
          id
          nickname
          name
          surname
          joined
        }
      }
    }
  `,

    // All Groups
    GET_ALL_GROUPS: `
    query GetAllGroups($first: Int, $after: String, $where: GroupFilterInput) {
      group {
        allgroups(first: $first, after: $after, where: $where) {
          nodes {
            id
            name
            description
            created
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }
    }
  `,

    // Group by ID
    GET_GROUP_BY_ID: `
    query GetGroupById($id: Int!) {
      group {
        groupbyid(id: $id) {
          id
          name
          description
          created
        }
      }
    }
  `,

    // Friend Requests
    GET_FRIEND_REQUESTS: `
    query GetFriendRequests($first: Int, $after: String) {
      friendRequest {
        allfriendrequests(first: $first, after: $after) {
          nodes {
            id
            sent
            requester {
              id
              nickname
              name
              surname
            }
            requestee {
              id
              nickname
              name
              surname
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    }
  `,

    // Group Invitations
    GET_GROUP_INVITATIONS: `
    query GetGroupInvitations($first: Int, $after: String) {
      projectInvitation {
        allprojectinvitations(first: $first, after: $after) {
          nodes {
            id
            sent
            project {
              id
              name
              description
            }
            inviting {
              id
              nickname
              name
              surname
            }
            invited {
              id
              nickname
              name
              surname
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    }
  `,

    // All Chats
    GET_ALL_CHATS: `
    query GetAllChats($first: Int, $after: String) {
      chat {
        allchats(first: $first, after: $after) {
          nodes {
            id
            projectId
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `,

    // Chat by ID
    GET_CHAT_BY_ID: `
    query GetChatById($id: Int!) {
      chat {
        chatbyid(id: $id) {
          id
          lastMessageAt
        }
      }
    }
  `,

    // Get all entries (messages) for a specific chat
    GET_CHAT_ENTRIES: `
    query GetChatEntries($chatId: Int!, $first: Int, $after: String) {
      entry {
        allentries(
          where: { userChat: { chatId: { eq: $chatId } } }
          order: [{ sent: ASC }]
          first: $first
          after: $after
        ) {
          nodes {
            id
            message
            sent
            public
            userChat {
              id
              user {
                id
                nickname
                name
                surname
                profilePic
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `,

    // Get UserChat ID for current user in a chat
    GET_USER_CHAT: `
    query GetUserChat($chatId: Int!) {
      chat {
        chatbyid(id: $chatId) {
          id
          userChats {
            id
            userId
            user {
              id
              nickname
            }
          }
        }
      }
    }
  `,

    // Create a new entry (send a message)
    CREATE_ENTRY: `
    mutation CreateEntry($input: EntryInput!) {
      entry {
        createEntry(input: $input) {
          id
          message
          sent
          public
          userChat {
            user {
              id
              nickname
            }
          }
        }
      }
    }
  `,

    // Get events for a project
    GET_PROJECT_EVENTS: `
    query GetProjectEvents($projectId: Int!, $first: Int, $after: String) {
      projectEvent {
        eventsbyproject(
          projectId: $projectId
          order: [{ eventDate: ASC }]
          first: $first
          after: $after
        ) {
          nodes {
            id
            title
            description
            eventDate
            time
            createdAt
            createdById
            createdBy {
              id
              nickname
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `,

    // Saved Posts
    GET_SAVED_POSTS: `
    query GetSavedPosts {
      savedPost {
        savedposts {
          id
          user {
            id
            nickname
            name
            surname
            profilePic
          }
          content
          title
          description
          created
          imageUrl
          likes {
            id
            userId
          }
          comments {
            id
            userId
            content
            createdAt
            user {
              id
              nickname
              name
              surname
            }
            likes {
              id
              userId
            }
            replies {
              id
              userId
              content
              createdAt
              user {
                id
                nickname
                name
                surname
              }
              likes {
                id
                userId
              }
            }
          }
          sharedPost {
            id
            user {
              id
              nickname
              name
              surname
            }
            content
            title
            description
            created
            imageUrl
          }
        }
      }
    }
  `,

    IS_POST_SAVED: `
    query IsPostSaved($postId: Int!) {
      savedPost {
        isPostSaved(postId: $postId)
      }
    }
  `,

    // Search users with filters
    SEARCH_USERS: `
    query SearchUsers($input: SearchUsersInput) {
      users {
        searchusers(input: $input) {
          user {
            id
            nickname
            name
            surname
            joined
            profilePic
            skills {
              id
              skillName
            }
            interests {
              id
              interestName
            }
          }
          hasPendingRequest
          isFriend
        }
      }
    }
  `,

    // Get suggested users based on matching interests and skills
    GET_SUGGESTED_USERS: `
    query GetSuggestedUsers($limit: Int = 10) {
      users {
        suggestedusers(limit: $limit) {
          user {
            id
            nickname
            name
            surname
            joined
            profilePic
            skills {
              id
              skillName
            }
            interests {
              id
              interestName
            }
          }
          matchScore
          commonSkills
          commonInterests
          commonProjects
          recentInteractions
          hasPendingRequest
        }
      }
    }
  `,

    // Search projects with filters
    SEARCH_PROJECTS: `
    query SearchProjects($input: SearchProjectsInput) {
      project {
        searchprojects(input: $input) {
          id
          name
          description
          imageUrl
          created
          lastUpdated
          owner {
            id
            nickname
            name
            surname
            profilePic
          }
          skills {
            id
            skillName
          }
          interests {
            id
            interestName
          }
          likes {
            id
          }
          views {
            id
          }
        }
      }
    }
  `,

    // Get my skills and interests
    GET_MY_TAGS: `
    query GetMyTags {
      userTag {
        myskills {
          id
          skillName
        }
        myinterests {
          id
          interestName
        }
      }
    }
  `,

    // Notifications
    GET_MY_NOTIFICATIONS: `
    query GetMyNotifications($limit: Int = 5) {
      notification {
        myNotifications(limit: $limit) {
          id
          type
          message
          isRead
          createdAt
          actorUser {
            id
            nickname
            name
            surname
            profilePic
          }
          post {
            id
            title
          }
        }
      }
    }
  `,

    GET_UNREAD_NOTIFICATIONS_COUNT: `
    query GetUnreadNotificationsCount {
      notification {
        unreadNotificationsCount
      }
    }
  `,

  // Admin Queries
  GET_REPORTED_POSTS: `
    query GetReportedPosts {
      admin {
        reportedPosts {
          id
          postId
          reportedBy
          reason
          createdAt
          isResolved
          post {
            id
            title
            content
            description
            imageUrl
            created
            user {
              id
              nickname
              name
              surname
              profilePic
            }
          }
          reportedByUser {
            id
            nickname
            name
            surname
            profilePic
          }
        }
      }
    }
  `,

  GET_PROJECT_FILES: `
    query GetProjectFiles($projectId: Int!) {
      projectFiles(projectId: $projectId) {
        id
        fileName
        blobPath
        url
        contentType
        fileSize
        type
        uploadedAt
        uploadedBy {
          id
          nickname
          name
          profilePic
        }
      }
    }
  `
};

// GraphQL Mutations
export const GRAPHQL_MUTATIONS = {
    REGISTER_USER: `
    mutation RegisterUser($input: UserRegisterInput!) {
      auth {
        registerUser(input: $input) {
          id
          name
          surname
          nickname
          email
          profilePic
          isModerator
        }
      }
    }
  `,

    LOGIN_USER: `
    mutation LoginUser($input: UserLoginInput!) {
      auth {
        loginUser(input: $input) {
          id
          name
          surname
          nickname
          email
          profilePic
          isModerator
        }
      }
    }
  `,

    LOGOUT: `
    mutation Logout {
      auth {
        logout
      }
    }
  `,

    REFRESH_TOKEN: `
    mutation RefreshToken {
      auth {
        refreshToken {
          id
          name
          surname
          nickname
          email
          profilePic
          isModerator
        }
      }
    }
  `,

    CREATE_POST: `
    mutation CreatePost($input: PostInput!) {
      post {
        createPost(input: $input) {
          id
          content
          title
          description
          imageUrl
          created
          projectId
          sharedPostId
          public
          user {
            id
            nickname
            name
            surname
            profilePic
          }
        }
      }
    }
  `,

    SEND_FRIEND_REQUEST: `
    mutation SendFriendRequest($requesteeId: Int!) {
      friendRequest {
        sendFriendRequest(requesteeId: $requesteeId) {
          id
          sent
          requester {
            id
            nickname
          }
          requestee {
            id
            nickname
          }
        }
      }
    }
  `,

    ACCEPT_FRIEND_REQUEST: `
    mutation AcceptFriendRequest($friendRequestId: Int!) {
      friendRequest {
        acceptFriendRequest(friendRequestId: $friendRequestId)
      }
    }
  `,

    REJECT_FRIEND_REQUEST: `
    mutation RejectFriendRequest($friendRequestId: Int!) {
      friendRequest {
        rejectFriendRequest(friendRequestId: $friendRequestId)
      }
    }
  `,

    ACCEPT_PROJECT_INVITATION: `
    mutation AcceptProjectInvitation($invitationId: Int!) {
      projectInvitation {
        acceptProjectInvitation(invitationId: $invitationId)
      }
    }
  `,

    REJECT_PROJECT_INVITATION: `
    mutation RejectProjectInvitation($invitationId: Int!) {
      projectInvitation {
        rejectProjectInvitation(invitationId: $invitationId)
      }
    }
  `,

    CREATE_PROJECT_INVITATION: `
    mutation CreateProjectInvitation($input: ProjectInvitationInput!) {
      projectInvitation {
        createProjectInvitation(input: $input) {
          id
          projectId
          invitingId
          invitedId
          sent
          expiring
        }
      }
    }
  `,

    REMOVE_FRIEND: `
    mutation RemoveFriend($friendId: Int!) {
      friendship {
        removeFriend(friendId: $friendId)
      }
    }
  `,

    BLOCK_USER: `
    mutation BlockUser($userIdToBlock: Int!) {
      blockedUser {
        blockUser(userIdToBlock: $userIdToBlock) {
          id
          userId
          blockedUserId
          blockedAt
        }
      }
    }
  `,

    UNBLOCK_USER: `
    mutation UnblockUser($userIdToUnblock: Int!) {
      blockedUser {
        unblockUser(userIdToUnblock: $userIdToUnblock)
      }
    }
  `,

    SAVE_POST: `
    mutation SavePost($postId: Int!) {
      savedPost {
        savePost(postId: $postId) {
          userId
          postId
          savedAt
        }
      }
    }
  `,

    UNSAVE_POST: `
    mutation UnsavePost($postId: Int!) {
      savedPost {
        unsavePost(postId: $postId)
      }
    }
  `,

    // Like a post
    LIKE_POST: `
    mutation LikePost($postId: Int!) {
      post {
        likePost(postId: $postId) {
          id
          userId
          postId
          createdAt
        }
      }
    }
  `,

    // Unlike a post
    UNLIKE_POST: `
    mutation UnlikePost($postId: Int!) {
      post {
        unlikePost(postId: $postId)
      }
    }
  `,

    // Add a comment to a post
    ADD_COMMENT: `
    mutation AddComment($postId: Int!, $content: String!, $parentCommentId: Int) {
      post {
        addComment(postId: $postId, content: $content, parentCommentId: $parentCommentId) {
          id
          userId
          postId
          content
          createdAt
          parentCommentId
          user {
            id
            nickname
            name
            surname
          }
        }
      }
    }
  `,

    // Delete a post
    DELETE_POST: `
    mutation DeletePost($postId: Int!) {
      post {
        deletePost(postId: $postId)
      }
    }
  `,

    // Delete a comment
    DELETE_COMMENT: `
    mutation DeleteComment($commentId: Int!) {
      post {
        deleteComment(commentId: $commentId)
      }
    }
  `,

    // Like a comment
    LIKE_COMMENT: `
    mutation LikeComment($commentId: Int!) {
      post {
        likeComment(commentId: $commentId) {
          id
          userId
          postCommentId
          createdAt
        }
      }
    }
  `,

    // Unlike a comment
    UNLIKE_COMMENT: `
    mutation UnlikeComment($commentId: Int!) {
      post {
        unlikeComment(commentId: $commentId)
      }
    }
  `,

    // Share a post
    SHARE_POST: `
    mutation SharePost($postId: Int!, $content: String, $projectId: Int) {
      post {
        sharePost(postId: $postId, content: $content, projectId: $projectId) {
          id
          userId
          content
          created
          sharedPostId
        }
      }
    }
  `,

    // Like a project
    LIKE_PROJECT: `
    mutation LikeProject($projectId: Int!) {
      project {
        likeproject(projectId: $projectId)
      }
    }
  `,

    // Unlike a project
    UNLIKE_PROJECT: `
    mutation UnlikeProject($projectId: Int!) {
      project {
        unlikeproject(projectId: $projectId)
      }
    }
  `,

    // Record a project view
    RECORD_PROJECT_VIEW: `
    mutation RecordProjectView($projectId: Int!) {
      project {
        recordprojectview(projectId: $projectId)
      }
    }
  `,

    // Check if user has liked a project
    HAS_LIKED_PROJECT: `
    query HasLikedProject($projectId: Int!) {
      project {
        haslikedproject(projectId: $projectId)
      }
    }
  `,

    // Send a message in a chat
    SEND_MESSAGE: `
    mutation SendMessage($input: EntryInput!) {
      entry {
        createEntry(input: $input) {
          id
          message
          sent
          public
          userChat {
            id
            userId
            user {
              id
              nickname
              name
              surname
            }
          }
        }
      }
    }
  `,

    // Add a skill
    ADD_SKILL: `
    mutation AddSkill($input: UserSkillInput!) {
      userTag {
        addskill(input: $input) {
          id
          skillName
          addedAt
        }
      }
    }
  `,

    // Remove a skill
    REMOVE_SKILL: `
    mutation RemoveSkill($skillId: Int!) {
      userTag {
        removeskill(skillId: $skillId)
      }
    }
  `,

    // Add an interest
    ADD_INTEREST: `
    mutation AddInterest($input: UserInterestInput!) {
      userTag {
        addinterest(input: $input) {
          id
          interestName
          addedAt
        }
      }
    }
  `,

    // Remove an interest
    REMOVE_INTEREST: `
    mutation RemoveInterest($interestId: Int!) {
      userTag {
        removeinterest(interestId: $interestId)
      }
    }
  `,

    // Create a new project
    CREATE_PROJECT: `
    mutation CreateProject($input: ProjectInput!) {
      project {
        createProject(input: $input) {
          id
          name
          description
          imageUrl
          isPublic
          created
          lastUpdated
          owner {
            id
            nickname
            name
            surname
          }
          skills {
            id
            skillName
          }
          interests {
            id
            interestName
          }
        }
      }
    }
  `,

    // Update a project
    UPDATE_PROJECT: `
    mutation UpdateProject($input: UpdateProjectInput!) {
      project {
        updateProject(input: $input) {
          id
          name
          description
          imageUrl
          isPublic
          lastUpdated
          owner {
            id
            nickname
            name
            surname
          }
        }
      }
    }
  `,

    // Delete a project
    DELETE_PROJECT: `
    mutation DeleteProject($id: Int!) {
      project {
        deleteProject(id: $id)
      }
    }
  `,

    // Remove a member from a project
    REMOVE_PROJECT_MEMBER: `
    mutation RemoveProjectMember($projectId: Int!, $userId: Int!) {
      project {
        removeProjectMember(projectId: $projectId, userId: $userId)
      }
    }
  `,

    // Create a project event
    CREATE_PROJECT_EVENT: `
    mutation CreateProjectEvent($input: ProjectEventInput!) {
      projectEvent {
        createProjectEvent(input: $input) {
          id
          title
          description
          eventDate
          time
          createdById
        }
      }
    }
  `,

    // Delete a project event
    DELETE_PROJECT_EVENT: `
    mutation DeleteProjectEvent($id: Int!) {
      projectEvent {
        deleteProjectEvent(id: $id)
      }
    }
  `,

    // Create a project with initial members
    CREATE_PROJECT_WITH_MEMBERS: `
    mutation CreateProjectWithMembers($input: CreateProjectWithMembersInput!) {
      project {
        createProjectWithMembers(input: $input) {
          id
          name
          description
          imageUrl
          isPublic
          created
          owner {
            id
            nickname
            name
            surname
            profilePic
          }
          skills {
            id
            skillName
          }
          interests {
            id
            interestName
          }
          collaborators {
            userId
            projectId
            role
            joinedAt
            user {
              id
              nickname
              name
              surname
              profilePic
            }
          }
        }
      }
    }
  `,

    // Notification mutations
    MARK_NOTIFICATION_AS_READ: `
    mutation MarkNotificationAsRead($notificationId: Int!) {
      notification {
        markNotificationAsRead(notificationId: $notificationId)
      }
    }
  `,

    MARK_ALL_NOTIFICATIONS_AS_READ: `
    mutation MarkAllNotificationsAsRead {
      notification {
        markAllNotificationsAsRead
      }
    }
  `,

  REPORT_POST: `
    mutation ReportPost($input: ReportPostInput!) {
      post {
        reportPost(input: $input) {
          id
          postId
          reportedBy
          reason
          createdAt
          isResolved
        }
      }
    }
  `,

  DELETE_REPORTED_POST: `
    mutation DeleteReportedPost($postId: Int!) {
      post {
        deleteReportedPost(postId: $postId)
      }
    }
  `,

  DISCARD_REPORT: `
    mutation DiscardReport($reportId: Int!) {
      post {
        discardReport(reportId: $reportId)
      }
    }
  `,

  // Blob storage mutations
  UPLOAD_BLOB: `
    mutation UploadBlob($input: UploadBlobInput!) {
      uploadBlob(input: $input) {
        id
        fileName
        blobPath
        contentType
        fileSize
        type
        uploadedAt
      }
    }
  `,

  DELETE_BLOB: `
    mutation DeleteBlob($input: DeleteBlobInput!) {
      deleteBlob(input: $input)
    }
  `,

  UPDATE_USER_PROFILE_IMAGE: `
    mutation UpdateUserProfileImage($input: UpdateUserProfileImageInput!) {
      updateUserProfileImage(input: $input) {
        id
        profilePic
        profilePicBlobId
      }
    }
  `,

  UPDATE_USER_BANNER_IMAGE: `
    mutation UpdateUserBannerImage($input: UpdateUserBannerImageInput!) {
      updateUserBannerImage(input: $input) {
        id
        bannerPic
        bannerPicBlobId
      }
    }
  `,

  UPDATE_PROJECT_IMAGE: `
    mutation UpdateProjectImage($input: UpdateProjectImageInput!) {
      updateProjectImage(input: $input) {
        id
        imageUrl
        imageBlobId
      }
    }
  `,

  UPDATE_PROJECT_BANNER: `
    mutation UpdateProjectBanner($input: UpdateProjectBannerInput!) {
      updateProjectBanner(input: $input) {
        id
        bannerBlobId
      }
    }
  `
};
