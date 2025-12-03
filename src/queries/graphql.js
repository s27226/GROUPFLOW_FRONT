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
        }
      }
    }
  `,

  // Trending Projects
  GET_TRENDING_PROJECTS: `
    query GetTrendingProjects($first: Int = 5) {
      project {
        trendingprojects(first: $first) {
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
  `
};

// GraphQL Mutations (for future use)
export const GRAPHQL_MUTATIONS = {
  REGISTER_USER: `
    mutation RegisterUser($input: UserRegisterInput!) {
      auth {
        registerUser(input: $input) {
          token
        }
      }
    }
  `,

  LOGIN_USER: `
    mutation LoginUser($input: UserLoginInput!) {
      auth {
        loginUser(input: $input) {
          token
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
      sendFriendRequest(requesteeId: $requesteeId) {
        id
        sent
        requester {
          nickname
        }
        requestee {
          nickname
        }
      }
    }
  `
};