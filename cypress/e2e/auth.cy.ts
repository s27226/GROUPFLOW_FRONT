/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearAuth();
  });

  describe('Login', () => {
    it('should display login page correctly', () => {
      cy.visit('/login');
      
      // Check for login form elements
      cy.get('input[placeholder="Email"]').should('be.visible');
      cy.get('input[placeholder="Password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible').contains(/login/i);
      
      // Check for register link
      cy.contains(/register|sign up/i).should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/login');
      cy.get('button[type="submit"]').click();
      
      // Email field should show validation
      cy.get('input[placeholder="Email"]:invalid').should('exist');
    });

    it('should show error for invalid credentials', () => {
      cy.intercept('POST', '**/api', {
        statusCode: 200,
        body: {
          errors: [{ message: 'Invalid email or password' }]
        }
      }).as('loginRequest');

      cy.visit('/login');
      cy.get('input[placeholder="Email"]').type('wrong@example.com');
      cy.get('input[placeholder="Password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.contains(/invalid|error|incorrect/i).should('be.visible');
    });

    it('should successfully login and redirect to main page', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxOTk5OTk5OTk5fQ.test';
      
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('Login')) {
          req.reply({
            body: {
              data: {
                auth: {
                  login: {
                    token: mockToken,
                    refreshToken: 'refresh-token'
                  }
                }
              }
            }
          });
        }
      }).as('loginRequest');

      cy.visit('/login');
      cy.get('input[placeholder="Email"]').type('test@example.com');
      cy.get('input[placeholder="Password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.url().should('not.include', '/login');
    });

    it('should navigate to register page', () => {
      cy.visit('/login');
      cy.contains(/register|sign up|create account/i).click();
      cy.url().should('include', '/register');
    });
  });

  describe('Registration', () => {
    it('should display registration page correctly', () => {
      cy.visit('/register');
      
      // Check for registration form elements
      cy.get('input[placeholder="First Name"]').should('be.visible');
      cy.get('input[placeholder="Email"]').should('be.visible');
      cy.get('input[placeholder="Password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show validation for weak password', () => {
      cy.visit('/register');
      cy.get('input[placeholder="First Name"]').type('John');
      cy.get('input[placeholder="Email"]').type('john@example.com');
      cy.get('input[placeholder="Password"]').type('123');
      cy.get('button[type="submit"]').click();
      
      // Should show password validation error
      cy.get('input[placeholder="Password"]:invalid').should('exist');
    });

    it('should successfully register and redirect', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('Register')) {
          req.reply({
            body: {
              data: {
                auth: {
                  register: {
                    token: 'new-user-token',
                    refreshToken: 'refresh-token'
                  }
                }
              }
            }
          });
        }
      }).as('registerRequest');

      cy.visit('/register');
      cy.get('input[placeholder="First Name"]').type('John');
      cy.get('input[placeholder*="Last"]').type('Doe');
      cy.get('input[placeholder="Email"]').type('john.doe@example.com');
      cy.get('input[placeholder*="Nickname"]').type('johndoe');
      cy.get('input[placeholder="Password"]').type('SecurePass123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@registerRequest');
    });
  });

  describe('Logout', () => {
    it('should logout and redirect to login page', () => {
      // Set a mock token to simulate logged in state
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'mock-token');
      });
      
      cy.visit('/');
      
      // Find and click logout (usually in navbar dropdown or settings)
      cy.get('[data-testid="user-menu"], .navbar-user, .user-dropdown').first().click({ force: true });
      cy.contains(/logout|sign out/i).click({ force: true });
      
      // Should redirect to login
      cy.url().should('include', '/login');
      
      // Token should be removed
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/');
      cy.url().should('include', '/login');
    });

    it('should redirect unauthenticated users from profile page', () => {
      cy.visit('/profile/1');
      cy.url().should('include', '/login');
    });

    it('should redirect unauthenticated users from projects page', () => {
      cy.visit('/myprojects');
      cy.url().should('include', '/login');
    });
  });
});
