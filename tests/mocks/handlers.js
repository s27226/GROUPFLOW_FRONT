import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock GraphQL endpoint for posts
  http.post('http://localhost:5000/api', async ({ request }) => {
    const body = await request.json();
    const { query } = body;

    // Handle GET_POSTS query
    if (query.includes('allposts')) {
      return HttpResponse.json({
        data: {
          post: {
            allposts: [
              {
                id: 1,
                title: 'Test Post 1',
                content: 'Test Content 1',
                description: 'Test Description 1',
                created: new Date().toISOString(),
                imageUrl: 'https://example.com/image1.jpg',
                user: {
                  id: 1,
                  nickname: 'testuser',
                  name: 'Test',
                  surname: 'User',
                },
              },
              {
                id: 2,
                title: 'Test Post 2',
                content: 'Test Content 2',
                description: 'Test Description 2',
                created: new Date().toISOString(),
                imageUrl: null,
                user: {
                  id: 2,
                  nickname: 'anotheruser',
                  name: 'Another',
                  surname: 'User',
                },
              },
            ],
          },
        },
      });
    }

    // Handle GET_TRENDING_PROJECTS query
    if (query.includes('trendingprojects')) {
      return HttpResponse.json({
        data: {
          project: {
            trendingprojects: {
              nodes: [
                {
                  id: 1,
                  name: 'Trending Project 1',
                  description: 'Description 1',
                  imageUrl: 'https://example.com/project1.jpg',
                  viewCount: 100,
                  likeCount: 50,
                  created: new Date().toISOString(),
                  owner: {
                    id: 1,
                    nickname: 'owner1',
                    name: 'Owner',
                  },
                },
              ],
              totalCount: 1,
            },
          },
        },
      });
    }

    // Handle LOGIN mutation
    if (query.includes('LoginUser')) {
      return HttpResponse.json({
        data: {
          LoginUser: {
            userId: 1,
            username: 'testuser',
            token: 'mock-jwt-token-12345',
          },
        },
      });
    }

    // Handle REGISTER mutation
    if (query.includes('RegisterUser')) {
      return HttpResponse.json({
        data: {
          registerUser: {
            userId: 1,
            name: 'New User',
            email: 'newuser@example.com',
            token: 'mock-jwt-token-67890',
          },
        },
      });
    }

    // Default response
    return HttpResponse.json({
      errors: [{ message: 'Query not mocked' }],
    });
  }),
];
