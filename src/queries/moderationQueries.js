// GraphQL queries for moderation features (plain strings for useGraphQL hook)

export const GET_ALL_USERS = `
  query GetAllUsers {
    moderation {
      allUsers {
        id
        name
        surname
        nickname
        email
        profilePic
        dateOfBirth
        joined
        isModerator
        isBanned
        banReason
        banExpiresAt
        suspendedUntil
        bannedByUserId
        bannedBy {
          id
          nickname
        }
      }
    }
  }
`;

export const GET_BANNED_USERS = `
  query GetBannedUsers {
    moderation {
      bannedUsers {
        id
        name
        surname
        nickname
        email
        profilePic
        dateOfBirth
        joined
        isModerator
        isBanned
        banReason
        banExpiresAt
        bannedByUserId
        bannedBy {
          id
          nickname
        }
      }
    }
  }
`;

export const GET_SUSPENDED_USERS = `
  query GetSuspendedUsers {
    moderation {
      suspendedUsers {
        id
        name
        surname
        nickname
        email
        profilePic
        dateOfBirth
        joined
        isModerator
        suspendedUntil
      }
    }
  }
`;

export const BAN_USER = `
  mutation BanUser($input: BanUserInput!) {
    moderation {
      banUser(input: $input) {
        id
        nickname
        isBanned
        banReason
        banExpiresAt
      }
    }
  }
`;

export const UNBAN_USER = `
  mutation UnbanUser($userId: Int!) {
    moderation {
      unbanUser(userId: $userId) {
        id
        nickname
        isBanned
      }
    }
  }
`;

export const SUSPEND_USER = `
  mutation SuspendUser($input: SuspendUserInput!) {
    moderation {
      suspendUser(input: $input) {
        id
        nickname
        suspendedUntil
      }
    }
  }
`;

export const UNSUSPEND_USER = `
  mutation UnsuspendUser($userId: Int!) {
    moderation {
      unsuspendUser(userId: $userId) {
        id
        nickname
        suspendedUntil
      }
    }
  }
`;

export const DELETE_POST = `
  mutation DeletePost($postId: Int!) {
    moderation {
      deletePost(postId: $postId)
    }
  }
`;

export const DELETE_COMMENT = `
  mutation DeleteComment($commentId: Int!) {
    moderation {
      deleteComment(commentId: $commentId)
    }
  }
`;

export const DELETE_PROJECT = `
  mutation DeleteProject($projectId: Int!) {
    moderation {
      deleteProject(projectId: $projectId)
    }
  }
`;

export const DELETE_CHAT = `
  mutation DeleteChat($chatId: Int!) {
    moderation {
      deleteChat(chatId: $chatId)
    }
  }
`;

export const RESET_PASSWORD = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    moderation {
      resetPassword(input: $input) {
        id
        nickname
      }
    }
  }
`;

export const MANAGE_USER_ROLE = `
  mutation ManageUserRole($input: ManageUserRoleInput!) {
    moderation {
      manageUserRole(input: $input) {
        id
        nickname
        isModerator
      }
    }
  }
`;
