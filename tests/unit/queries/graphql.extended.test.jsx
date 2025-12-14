import { describe, it, expect } from 'vitest';
import { GRAPHQL_QUERIES, GRAPHQL_MUTATIONS } from '@/queries/graphql';

describe('GRAPHQL_QUERIES Extended Tests', () => {
  describe('Query structure validation', () => {
    it('should export GRAPHQL_QUERIES object', () => {
      expect(GRAPHQL_QUERIES).toBeDefined();
      expect(typeof GRAPHQL_QUERIES).toBe('object');
    });

    it('should contain all expected query keys', () => {
      const expectedKeys = [
        'GET_POSTS',
        'GET_TRENDING_PROJECTS',
        'GET_MY_PROJECTS',
        'GET_MY_FRIENDS',
        'GET_USER_BY_ID',
        'GET_USER_PROJECTS'
      ];
      
      expectedKeys.forEach(key => {
        expect(GRAPHQL_QUERIES).toHaveProperty(key);
      });
    });

    it('should have all queries as non-empty strings', () => {
      Object.values(GRAPHQL_QUERIES).forEach(query => {
        expect(typeof query).toBe('string');
        expect(query.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have queries that start with query keyword', () => {
      Object.values(GRAPHQL_QUERIES).forEach(query => {
        const trimmed = query.trim();
        expect(trimmed).toMatch(/^query\s+\w+/);
      });
    });
  });

  describe('GET_POSTS query', () => {
    it('should be a valid GraphQL query', () => {
      expect(GRAPHQL_QUERIES.GET_POSTS).toContain('query GetPosts');
    });

    it('should request post.allposts field', () => {
      expect(GRAPHQL_QUERIES.GET_POSTS).toContain('post');
      expect(GRAPHQL_QUERIES.GET_POSTS).toContain('allposts');
    });

    it('should request all required post fields', () => {
      const requiredFields = ['id', 'content', 'title', 'description', 'created', 'imageUrl'];
      requiredFields.forEach(field => {
        expect(GRAPHQL_QUERIES.GET_POSTS).toContain(field);
      });
    });

    it('should request nested user information', () => {
      expect(GRAPHQL_QUERIES.GET_POSTS).toContain('user');
      expect(GRAPHQL_QUERIES.GET_POSTS).toContain('nickname');
      expect(GRAPHQL_QUERIES.GET_POSTS).toContain('name');
      expect(GRAPHQL_QUERIES.GET_POSTS).toContain('surname');
    });
  });

  describe('GET_TRENDING_PROJECTS query', () => {
    it('should be a valid GraphQL query', () => {
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('query GetTrendingProjects');
    });

    it('should accept first parameter with default value', () => {
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toMatch(/\$first:\s*Int\s*=\s*5/);
    });

    it('should request project.trendingprojects field', () => {
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('project');
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('trendingprojects');
    });

    it('should request nodes and totalCount', () => {
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('nodes');
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('totalCount');
    });

    it('should request project metrics', () => {
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('viewCount');
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('likeCount');
    });

    it('should request owner information', () => {
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('owner');
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('nickname');
    });
  });

  describe('GET_MY_PROJECTS query', () => {
    it('should be a valid GraphQL query', () => {
      expect(GRAPHQL_QUERIES.GET_MY_PROJECTS).toContain('query GetMyProjects');
    });

    it('should request project.myprojects field', () => {
      expect(GRAPHQL_QUERIES.GET_MY_PROJECTS).toContain('project');
      expect(GRAPHQL_QUERIES.GET_MY_PROJECTS).toContain('myprojects');
    });

    it('should request project metadata fields', () => {
      const fields = ['created', 'lastUpdated', 'isPublic'];
      fields.forEach(field => {
        expect(GRAPHQL_QUERIES.GET_MY_PROJECTS).toContain(field);
      });
    });
  });

  describe('GET_MY_FRIENDS query', () => {
    it('should be a valid GraphQL query', () => {
      expect(GRAPHQL_QUERIES.GET_MY_FRIENDS).toContain('query GetMyFriends');
    });

    it('should request friendship.myfriends field', () => {
      expect(GRAPHQL_QUERIES.GET_MY_FRIENDS).toContain('friendship');
      expect(GRAPHQL_QUERIES.GET_MY_FRIENDS).toContain('myfriends');
    });

    it('should request friend details', () => {
      const fields = ['id', 'nickname', 'name', 'surname', 'joined'];
      fields.forEach(field => {
        expect(GRAPHQL_QUERIES.GET_MY_FRIENDS).toContain(field);
      });
    });
  });

  describe('GET_USER_BY_ID query', () => {
    it('should be a valid GraphQL query', () => {
      expect(GRAPHQL_QUERIES.GET_USER_BY_ID).toContain('query GetUserById');
    });

    it('should accept id parameter', () => {
      expect(GRAPHQL_QUERIES.GET_USER_BY_ID).toMatch(/\$id:\s*Int!/);
    });

    it('should request users.getuserbyid field', () => {
      expect(GRAPHQL_QUERIES.GET_USER_BY_ID).toContain('users');
      expect(GRAPHQL_QUERIES.GET_USER_BY_ID).toContain('getuserbyid');
    });

    it('should pass id parameter to getuserbyid', () => {
      expect(GRAPHQL_QUERIES.GET_USER_BY_ID).toMatch(/getuserbyid\(id:\s*\$id\)/);
    });

    it('should request comprehensive user information', () => {
      const fields = ['id', 'nickname', 'name', 'surname', 'email', 'joined', 'dateOfBirth'];
      fields.forEach(field => {
        expect(GRAPHQL_QUERIES.GET_USER_BY_ID).toContain(field);
      });
    });
  });

  describe('GET_USER_PROJECTS query', () => {
    it('should be a valid GraphQL query', () => {
      expect(GRAPHQL_QUERIES.GET_USER_PROJECTS).toContain('query GetUserProjects');
    });

    it('should accept userId parameter', () => {
      expect(GRAPHQL_QUERIES.GET_USER_PROJECTS).toMatch(/\$userId:\s*Int!/);
    });

    it('should request project.userprojects field', () => {
      expect(GRAPHQL_QUERIES.GET_USER_PROJECTS).toContain('project');
      expect(GRAPHQL_QUERIES.GET_USER_PROJECTS).toContain('userprojects');
    });

    it('should pass userId parameter to userprojects', () => {
      expect(GRAPHQL_QUERIES.GET_USER_PROJECTS).toMatch(/userprojects\(userId:\s*\$userId\)/);
    });
  });
});

describe('GRAPHQL_MUTATIONS Extended Tests', () => {
  describe('Mutation structure validation', () => {
    it('should export GRAPHQL_MUTATIONS object', () => {
      expect(GRAPHQL_MUTATIONS).toBeDefined();
      expect(typeof GRAPHQL_MUTATIONS).toBe('object');
    });

    it('should contain expected mutation keys', () => {
      const expectedKeys = ['CREATE_POST', 'SEND_FRIEND_REQUEST'];
      expectedKeys.forEach(key => {
        expect(GRAPHQL_MUTATIONS).toHaveProperty(key);
      });
    });

    it('should have all mutations as non-empty strings', () => {
      Object.values(GRAPHQL_MUTATIONS).forEach(mutation => {
        expect(typeof mutation).toBe('string');
        expect(mutation.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have mutations that start with mutation keyword', () => {
      Object.values(GRAPHQL_MUTATIONS).forEach(mutation => {
        const trimmed = mutation.trim();
        expect(trimmed).toMatch(/^mutation\s+\w+/);
      });
    });
  });

  describe('CREATE_POST mutation', () => {
    it('should be a valid GraphQL mutation', () => {
      expect(GRAPHQL_MUTATIONS.CREATE_POST).toContain('mutation CreatePost');
    });

    it('should accept input parameter', () => {
      expect(GRAPHQL_MUTATIONS.CREATE_POST).toMatch(/\$input:\s*PostInput!/);
    });

    it('should call createPost with input', () => {
      expect(GRAPHQL_MUTATIONS.CREATE_POST).toContain('createPost');
      expect(GRAPHQL_MUTATIONS.CREATE_POST).toMatch(/createPost\(input:\s*\$input\)/);
    });

    it('should return created post fields', () => {
      const fields = ['id', 'content', 'title', 'created'];
      fields.forEach(field => {
        expect(GRAPHQL_MUTATIONS.CREATE_POST).toContain(field);
      });
    });

    it('should return user information', () => {
      expect(GRAPHQL_MUTATIONS.CREATE_POST).toContain('user');
      expect(GRAPHQL_MUTATIONS.CREATE_POST).toContain('nickname');
    });
  });

  describe('SEND_FRIEND_REQUEST mutation', () => {
    it('should be a valid GraphQL mutation', () => {
      expect(GRAPHQL_MUTATIONS.SEND_FRIEND_REQUEST).toContain('mutation SendFriendRequest');
    });

    it('should accept requesteeId parameter', () => {
      expect(GRAPHQL_MUTATIONS.SEND_FRIEND_REQUEST).toMatch(/\$requesteeId:\s*Int!/);
    });

    it('should call sendFriendRequest with requesteeId', () => {
      expect(GRAPHQL_MUTATIONS.SEND_FRIEND_REQUEST).toContain('sendFriendRequest');
      expect(GRAPHQL_MUTATIONS.SEND_FRIEND_REQUEST).toMatch(/sendFriendRequest\(requesteeId:\s*\$requesteeId\)/);
    });

    it('should return friend request details', () => {
      const fields = ['id', 'sent', 'requester', 'requestee'];
      fields.forEach(field => {
        expect(GRAPHQL_MUTATIONS.SEND_FRIEND_REQUEST).toContain(field);
      });
    });

    it('should return requester and requestee nicknames', () => {
      // Check that nickname appears at least twice (once for requester, once for requestee)
      const nicknameCount = (GRAPHQL_MUTATIONS.SEND_FRIEND_REQUEST.match(/nickname/g) || []).length;
      expect(nicknameCount).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('Query and Mutation integration', () => {
  it('should use consistent field naming conventions', () => {
    const allGraphQL = { ...GRAPHQL_QUERIES, ...GRAPHQL_MUTATIONS };
    Object.values(allGraphQL).forEach(gql => {
      // Check for camelCase field naming inside query/mutation bodies
      // Query/Mutation names themselves can be PascalCase (e.g., GetPosts, LoginUser)
      const lines = gql.split('\n');
      lines.forEach(line => {
        // Skip query/mutation definition lines
        if (line.trim().match(/^(query|mutation)\s+\w+/)) {
          return;
        }
        // Check field names (but not types or variables)
        const fieldMatches = line.match(/\s+(\w+)\s*[{:]/g);
        if (fieldMatches) {
          fieldMatches.forEach(match => {
            const field = match.trim().split(/[{:]/)[0];
            // Field should start with lowercase (camelCase), skip variables ($) and type references
            if (field && !field.includes('$') && !field.match(/^[A-Z][a-z]+Input$/) && field.length > 0) {
              // Query names like GetPosts are PascalCase and that's OK
              if (!line.includes('query ') && !line.includes('mutation ')) {
                expect(field[0]).toMatch(/[a-z]/);
              }
            }
          });
        }
      });
    });
  });

  it('should have consistent user field structure across queries', () => {
    const queriesWithUser = [
      GRAPHQL_QUERIES.GET_POSTS,
      GRAPHQL_QUERIES.GET_TRENDING_PROJECTS,
      GRAPHQL_QUERIES.GET_MY_FRIENDS
    ];

    queriesWithUser.forEach(query => {
      expect(query).toContain('nickname');
    });
  });
});
