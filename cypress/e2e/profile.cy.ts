/// <reference types="cypress" />

describe('User Profile', () => {
  const mockUser = {
    id: '1',
    nickname: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    profilePic: null,
    bannerUrl: null,
    bio: 'This is my bio',
    skills: [
      { id: 1, skillName: 'JavaScript' },
      { id: 2, skillName: 'React' }
    ],
    interests: [
      { id: 1, interestName: 'Web Development' },
      { id: 2, interestName: 'Open Source' }
    ]
  };

  const mockOtherUser = {
    id: '2',
    nickname: 'otheruser',
    name: 'Other',
    surname: 'User',
    email: 'other@example.com',
    profilePic: 'https://picsum.photos/100',
    bio: 'I am another user'
  };

  const mockUserPosts = [
    {
      id: 1,
      content: 'My first post',
      created: new Date().toISOString(),
      user: mockUser,
      likes: [],
      comments: []
    }
  ];

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-valid-token');
    });

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
      } else if (query.includes('userbyid') || query.includes('GetUserById')) {
        const userId = req.body.variables?.id;
        const user = userId === 2 || userId === '2' ? mockOtherUser : mockUser;
        req.reply({
          body: {
            data: {
              users: {
                userbyid: user
              }
            }
          }
        });
      } else if (query.includes('userposts')) {
        req.reply({
          body: {
            data: {
              post: {
                userposts: mockUserPosts
              }
            }
          }
        });
      } else {
        req.reply({ body: { data: {} } });
      }
    }).as('graphqlRequest');
  });

  describe('Own Profile Page', () => {
    it('should display user profile with all details', () => {
      cy.visit('/profile/1');
      
      // User info
      cy.contains('testuser').should('be.visible');
      cy.contains('Test User').should('be.visible');
      cy.contains('This is my bio').should('be.visible');
    });

    it('should display user skills', () => {
      cy.visit('/profile/1');
      
      cy.contains('JavaScript').should('be.visible');
      cy.contains('React').should('be.visible');
    });

    it('should display user interests', () => {
      cy.visit('/profile/1');
      
      cy.contains('Web Development').should('be.visible');
      cy.contains('Open Source').should('be.visible');
    });

    it('should display user posts', () => {
      cy.visit('/profile/1');
      
      cy.contains('My first post').should('be.visible');
    });

    it('should show edit profile button for own profile', () => {
      cy.visit('/profile/1');
      
      cy.get('button, a').contains(/edit/i).should('be.visible');
    });

    it('should navigate to edit profile page', () => {
      cy.visit('/profile/1');
      
      cy.get('button, a').contains(/edit/i).click();
      
      cy.url().should('include', '/editprofile');
    });
  });

  describe('Other User Profile Page', () => {
    it('should display other user profile', () => {
      cy.visit('/profile/2');
      
      cy.contains('otheruser').should('be.visible');
      cy.contains('I am another user').should('be.visible');
    });

    it('should show add friend button for other users', () => {
      cy.visit('/profile/2');
      
      cy.get('button').contains(/add friend|connect|follow/i).should('be.visible');
    });

    it('should not show edit button for other users', () => {
      cy.visit('/profile/2');
      
      // Edit button should not exist for other users
      cy.get('button, a').contains(/edit profile/i).should('not.exist');
    });

    it('should show message button for other users', () => {
      cy.visit('/profile/2');
      
      cy.get('button').contains(/message|chat/i).should('be.visible');
    });
  });

  describe('Edit Profile', () => {
    it('should display edit profile form', () => {
      cy.visit('/editprofile');
      
      // Form fields
      cy.get('input, textarea').should('have.length.at.least', 1);
    });

    it('should pre-fill form with current user data', () => {
      cy.visit('/editprofile');
      
      cy.get('textarea[placeholder*="bio" i], textarea[name="bio"]')
        .should('contain.value', 'This is my bio');
    });

    it('should update profile successfully', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('UpdateProfile') || req.body.query?.includes('updateuser')) {
          req.reply({
            body: {
              data: {
                users: {
                  updateuser: {
                    ...mockUser,
                    bio: 'Updated bio text'
                  }
                }
              }
            }
          });
        }
      }).as('updateProfile');

      cy.visit('/editprofile');
      
      cy.get('textarea[placeholder*="bio" i], textarea[name="bio"]')
        .clear()
        .type('Updated bio text');
      
      cy.get('button[type="submit"], button').contains(/save|update/i).click();
    });

    it('should allow profile picture upload', () => {
      cy.visit('/editprofile');
      
      // Check for file input or upload button
      cy.get('input[type="file"], button').contains(/upload|change photo|profile picture/i)
        .should('exist');
    });
  });
});
