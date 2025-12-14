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
          }
          content
          title
          description
          created
          imageUrl
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
            viewCount
            likeCount
            created
            owner {
              id
              nickname
              name
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
          viewCount
          likeCount
          owner {
            id
            nickname
            name
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
            viewCount
            likeCount
            created
            lastUpdated
            owner {
              id
              nickname
              name
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
          viewCount
          likeCount
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

  // Create a new project event
  CREATE_PROJECT_EVENT: `
    mutation CreateProjectEvent($input: ProjectEventInput!) {
      projectEvent {
        createProjectEvent(input: $input) {
          id
          title
          description
          eventDate
          time
          createdBy {
            id
            nickname
          }
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
          hasPendingRequest
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
  `
};

// GraphQL Mutations (for future use)
export const GRAPHQL_MUTATIONS = {
  REGISTER_USER: `
    mutation RegisterUser($input: UserRegisterInput!) {
      auth {
        registerUser(input: $input) {
          id
          name
          email
          token
          refreshToken
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
          email
          token
          refreshToken
        }
      }
    }
  `,

  REFRESH_TOKEN: `
    mutation RefreshToken($refreshToken: String!) {
      auth {
        refreshToken(refreshToken: $refreshToken) {
          id
          name
          email
          token
          refreshToken
        }
      }
    }
  `,

  CREATE_POST: `
    mutation CreatePost($input: PostInput!) {
      createPost(input: $input) {
        id
        content
        title
        created
        user {
          nickname
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

  REMOVE_FRIEND: `
    mutation RemoveFriend($friendId: Int!) {
      friendship {
        removeFriend(friendId: $friendId)
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
  `
};