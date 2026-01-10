/// <reference types="cypress" />

describe('Chat and Messaging', () => {
  const mockUser = {
    id: '1',
    nickname: 'testuser',
    name: 'Test',
    surname: 'User'
  };

  const mockFriend = {
    id: '2',
    nickname: 'friend',
    name: 'Friend',
    surname: 'User',
    profilePic: null
  };

  const mockChats = [
    {
      id: 1,
      participants: [mockUser, mockFriend],
      lastMessage: {
        content: 'Hey, how are you?',
        createdAt: new Date().toISOString(),
        senderId: '2'
      }
    }
  ];

  const mockMessages = [
    {
      id: 1,
      content: 'Hello!',
      senderId: '1',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      content: 'Hey, how are you?',
      senderId: '2',
      createdAt: new Date().toISOString()
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
              users: { me: mockUser }
            }
          }
        });
      } else if (query.includes('chats') || query.includes('conversations')) {
        req.reply({
          body: {
            data: {
              chat: {
                userchats: mockChats
              }
            }
          }
        });
      } else if (query.includes('messages')) {
        req.reply({
          body: {
            data: {
              chat: {
                messages: mockMessages
              }
            }
          }
        });
      } else {
        req.reply({ body: { data: {} } });
      }
    }).as('graphqlRequest');
  });

  describe('Chat List', () => {
    it('should display chat list page', () => {
      cy.visit('/chat');
      
      // Should show chat list
      cy.get('[class*="chat"], [class*="conversation"]').should('be.visible');
    });

    it('should display conversations with last message', () => {
      cy.visit('/chat');
      
      cy.contains('friend').should('be.visible');
      cy.contains('Hey, how are you?').should('be.visible');
    });

    it('should open a conversation on click', () => {
      cy.visit('/chat');
      
      cy.contains('friend').click();
      
      // Should show message history
      cy.contains('Hello!').should('be.visible');
      cy.contains('Hey, how are you?').should('be.visible');
    });
  });

  describe('Chat Window', () => {
    it('should display chat header with user info', () => {
      cy.visit('/chat/1');
      
      cy.get('[class*="header"]').within(() => {
        cy.contains('friend').should('be.visible');
      });
    });

    it('should display message history', () => {
      cy.visit('/chat/1');
      
      cy.contains('Hello!').should('be.visible');
      cy.contains('Hey, how are you?').should('be.visible');
    });

    it('should display message input', () => {
      cy.visit('/chat/1');
      
      cy.get('input[placeholder*="message" i], textarea[placeholder*="message" i]')
        .should('be.visible');
    });

    it('should send a message', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('SendMessage') || req.body.query?.includes('sendmessage')) {
          req.reply({
            body: {
              data: {
                chat: {
                  sendmessage: {
                    id: 999,
                    content: 'My new message',
                    senderId: '1',
                    createdAt: new Date().toISOString()
                  }
                }
              }
            }
          });
        }
      }).as('sendMessage');

      cy.visit('/chat/1');
      
      cy.get('input[placeholder*="message" i], textarea[placeholder*="message" i]')
        .type('My new message');
      
      cy.get('button[type="submit"], button').contains(/send/i).click();
    });

    it('should send message on Enter key', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('SendMessage')) {
          req.reply({
            body: {
              data: {
                chat: {
                  sendmessage: {
                    id: 999,
                    content: 'Enter key message',
                    senderId: '1'
                  }
                }
              }
            }
          });
        }
      }).as('sendMessage');

      cy.visit('/chat/1');
      
      cy.get('input[placeholder*="message" i], textarea[placeholder*="message" i]')
        .type('Enter key message{enter}');
    });

    it('should show own messages aligned right', () => {
      cy.visit('/chat/1');
      
      // Own messages (senderId: '1') should have different styling
      cy.contains('Hello!').closest('[class*="message"]')
        .should('have.class', /own|self|sent|right/i);
    });
  });

  describe('Start New Chat', () => {
    it('should start chat from user profile', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('userbyid')) {
          req.reply({
            body: {
              data: {
                users: {
                  userbyid: mockFriend
                }
              }
            }
          });
        }
      }).as('getUser');

      cy.visit('/profile/2');
      
      cy.get('button').contains(/message|chat/i).click();
      
      cy.url().should('include', '/chat');
    });
  });
});
