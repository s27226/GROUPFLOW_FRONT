/// <reference types="cypress" />

describe('Navigation and Layout', () => {
  const mockUser = {
    id: '1',
    nickname: 'testuser',
    name: 'Test',
    surname: 'User'
  };

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
      } else {
        req.reply({ body: { data: {} } });
      }
    }).as('graphqlRequest');
  });

  describe('Navbar', () => {
    it('should display navbar on all authenticated pages', () => {
      cy.visit('/');
      cy.get('nav, .navbar, [class*="navbar"]').should('be.visible');
    });

    it('should show user profile section', () => {
      cy.visit('/');
      cy.get('nav, .navbar, [class*="navbar"]').within(() => {
        cy.contains('testuser').should('be.visible');
      });
    });

    it('should have search functionality', () => {
      cy.visit('/');
      cy.get('nav, .navbar, [class*="navbar"]').within(() => {
        cy.get('input[placeholder*="search" i], button[aria-label*="search" i]').should('exist');
      });
    });

    it('should navigate to profile when clicking user avatar', () => {
      cy.visit('/');
      cy.get('nav, .navbar, [class*="navbar"]').within(() => {
        cy.get('img[alt*="profile" i], [class*="avatar"]').first().click();
      });
      cy.url().should('include', '/profile');
    });

    it('should show notifications button', () => {
      cy.visit('/');
      cy.get('nav, .navbar, [class*="navbar"]').within(() => {
        cy.get('button[aria-label*="notification" i], [class*="notification"]').should('exist');
      });
    });
  });

  describe('Sidebar', () => {
    it('should display sidebar on authenticated pages', () => {
      cy.visit('/');
      cy.get('[class*="sidebar"], aside').should('be.visible');
    });

    it('should have navigation links', () => {
      cy.visit('/');
      cy.get('[class*="sidebar"], aside').within(() => {
        // Common navigation items
        cy.get('a, button').should('have.length.at.least', 3);
      });
    });

    it('should navigate to feed/home', () => {
      cy.visit('/myprojects');
      cy.get('[class*="sidebar"], aside').within(() => {
        cy.get('a, button').contains(/home|feed/i).click();
      });
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should navigate to projects', () => {
      cy.visit('/');
      cy.get('[class*="sidebar"], aside').within(() => {
        cy.get('a, button').contains(/project/i).click();
      });
      cy.url().should('include', 'project');
    });

    it('should navigate to chat/messages', () => {
      cy.visit('/');
      cy.get('[class*="sidebar"], aside').within(() => {
        cy.get('a, button').contains(/chat|message/i).click();
      });
      cy.url().should('include', 'chat');
    });

    it('should navigate to friends', () => {
      cy.visit('/');
      cy.get('[class*="sidebar"], aside').within(() => {
        cy.get('a, button').contains(/friend/i).click();
      });
      cy.url().should('include', 'friend');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      
      // Content should still be visible
      cy.get('[class*="content"], main').should('be.visible');
    });

    it('should adapt to tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit('/');
      
      cy.get('[class*="content"], main').should('be.visible');
    });

    it('should work on desktop viewport', () => {
      cy.viewport(1920, 1080);
      cy.visit('/');
      
      cy.get('[class*="sidebar"], aside').should('be.visible');
      cy.get('[class*="content"], main').should('be.visible');
    });
  });

  describe('Page Transitions', () => {
    it('should navigate between main sections', () => {
      cy.visit('/');
      
      // Go to projects
      cy.get('[class*="sidebar"], aside').within(() => {
        cy.get('a, button').contains(/project/i).click();
      });
      cy.url().should('include', 'project');
      
      // Go to chat
      cy.get('[class*="sidebar"], aside').within(() => {
        cy.get('a, button').contains(/chat|message/i).click();
      });
      cy.url().should('include', 'chat');
      
      // Go back to feed
      cy.get('[class*="sidebar"], aside').within(() => {
        cy.get('a, button').contains(/home|feed/i).click();
      });
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should maintain layout during navigation', () => {
      cy.visit('/');
      
      // Check initial layout
      cy.get('nav, .navbar, [class*="navbar"]').should('be.visible');
      cy.get('[class*="sidebar"], aside').should('be.visible');
      
      // Navigate and verify layout persists
      cy.get('[class*="sidebar"], aside').within(() => {
        cy.get('a, button').contains(/project/i).click();
      });
      
      cy.get('nav, .navbar, [class*="navbar"]').should('be.visible');
      cy.get('[class*="sidebar"], aside').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should show 404 for unknown routes', () => {
      cy.visit('/unknown-page-12345', { failOnStatusCode: false });
      
      cy.contains(/not found|404|page doesn't exist/i).should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      cy.intercept('POST', '**/api', {
        statusCode: 500,
        body: { errors: [{ message: 'Internal Server Error' }] }
      }).as('apiError');

      cy.visit('/');
      
      // App should not crash, should show error state or fallback
      cy.get('body').should('be.visible');
    });
  });
});
