/// <reference types="cypress" />

describe('Feed and Posts', () => {
  const mockUser = {
    id: '1',
    nickname: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    profilePic: null
  };

  const mockPosts = [
    {
      id: 1,
      content: 'This is a test post',
      title: 'Test Post',
      created: new Date().toISOString(),
      imageUrl: null,
      user: mockUser,
      likes: [],
      comments: []
    },
    {
      id: 2,
      content: 'Another test post with image',
      title: 'Image Post',
      created: new Date().toISOString(),
      imageUrl: 'https://picsum.photos/400/300',
      user: mockUser,
      likes: [{ userId: 2 }],
      comments: [
        {
          id: 1,
          content: 'Great post!',
          user: { id: 2, nickname: 'commenter' }
        }
      ]
    }
  ];

  beforeEach(() => {
    // Set up authenticated state
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-valid-token');
    });

    // Mock API responses
    cy.intercept('POST', '**/api', (req) => {
      const query = req.body.query || '';
      
      if (query.includes('GetCurrentUser') || query.includes('me')) {
        req.reply({
          body: {
            data: {
              users: {
                me: mockUser
              }
            }
          }
        });
      } else if (query.includes('allposts')) {
        req.reply({
          body: {
            data: {
              post: {
                allposts: mockPosts
              }
            }
          }
        });
      } else if (query.includes('trendingprojects')) {
        req.reply({
          body: {
            data: {
              project: {
                trendingprojects: {
                  nodes: [],
                  totalCount: 0
                }
              }
            }
          }
        });
      } else {
        req.reply({ body: { data: {} } });
      }
    }).as('graphqlRequest');
  });

  describe('Main Feed Page', () => {
    it('should display the feed page with posts', () => {
      cy.visit('/');
      
      // Should show feed content
      cy.contains('This is a test post').should('be.visible');
      cy.contains('Another test post with image').should('be.visible');
    });

    it('should display navigation elements', () => {
      cy.visit('/');
      
      // Check navbar is present
      cy.get('nav, .navbar, [class*="navbar"]').should('be.visible');
      
      // Check sidebar is present
      cy.get('[class*="sidebar"], aside').should('be.visible');
    });

    it('should display user profile in navbar', () => {
      cy.visit('/');
      
      // User nickname should appear in navbar
      cy.get('nav, .navbar, [class*="navbar"]').within(() => {
        cy.contains('testuser').should('be.visible');
      });
    });

    it('should display post with all elements', () => {
      cy.visit('/');
      
      // Check post structure
      cy.get('[class*="post"]').first().within(() => {
        // Author name
        cy.contains('testuser').should('be.visible');
        
        // Post content
        cy.contains('This is a test post').should('be.visible');
        
        // Action buttons (like, comment, share)
        cy.get('button').should('have.length.at.least', 1);
      });
    });

    it('should show post with image', () => {
      cy.visit('/');
      
      // Find post with image
      cy.contains('Another test post with image')
        .closest('[class*="post"]')
        .find('img')
        .should('be.visible');
    });
  });

  describe('Post Interactions', () => {
    it('should like a post', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('LikePost') || req.body.query?.includes('likepost')) {
          req.reply({
            body: {
              data: {
                post: {
                  likepost: { id: 1, liked: true }
                }
              }
            }
          });
        }
      }).as('likePost');

      cy.visit('/');
      
      // Click like button on first post
      cy.get('[class*="post"]').first().within(() => {
        cy.get('button').contains(/like/i).click();
      });
    });

    it('should open comment section', () => {
      cy.visit('/');
      
      // Click comment button
      cy.get('[class*="post"]').first().within(() => {
        cy.get('button').contains(/comment/i).click();
      });
      
      // Comment input should appear
      cy.get('input[placeholder*="comment"], textarea[placeholder*="comment"]').should('be.visible');
    });

    it('should add a comment to a post', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('AddComment') || req.body.query?.includes('addcomment')) {
          req.reply({
            body: {
              data: {
                post: {
                  addcomment: {
                    id: 999,
                    content: 'My new comment',
                    user: mockUser
                  }
                }
              }
            }
          });
        }
      }).as('addComment');

      cy.visit('/');
      
      // Open comments and add one
      cy.get('[class*="post"]').first().within(() => {
        cy.get('button').contains(/comment/i).click();
      });
      
      cy.get('input[placeholder*="comment"], textarea[placeholder*="comment"]')
        .first()
        .type('My new comment{enter}');
    });

    it('should share a post', () => {
      cy.visit('/');
      
      // Click share button
      cy.get('[class*="post"]').first().within(() => {
        cy.get('button').contains(/share/i).click();
      });
      
      // Share modal or confirmation should appear
      cy.get('[class*="modal"], [class*="dialog"], [role="dialog"]').should('be.visible');
    });
  });

  describe('Create Post', () => {
    it('should show create post input', () => {
      cy.visit('/');
      
      // Post creation input/textarea should be visible
      cy.get('textarea[placeholder*="post"], input[placeholder*="post"], [class*="create-post"]')
        .should('be.visible');
    });

    it('should create a new text post', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('CreatePost') || req.body.query?.includes('createpost')) {
          req.reply({
            body: {
              data: {
                post: {
                  createpost: {
                    id: 999,
                    content: 'My new post content',
                    user: mockUser,
                    created: new Date().toISOString()
                  }
                }
              }
            }
          });
        }
      }).as('createPost');

      cy.visit('/');
      
      // Type in post creation area
      cy.get('textarea[placeholder*="post"], [class*="create-post"] textarea')
        .first()
        .type('My new post content');
      
      // Submit the post
      cy.get('button').contains(/post|submit|share/i).click();
    });
  });
});
