/// <reference types="cypress" />

// Custom commands for the application

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to login via API and set token
       * @example cy.loginViaApi('test@example.com', 'password123')
       */
      loginViaApi(email: string, password: string): Chainable<void>;
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;
      
      /**
       * Custom command to set a valid JWT token in localStorage
       * @example cy.setAuthToken('eyJ...')
       */
      setAuthToken(token: string): Chainable<void>;
      
      /**
       * Custom command to clear authentication
       * @example cy.clearAuth()
       */
      clearAuth(): Chainable<void>;
      
      /**
       * Custom command to intercept GraphQL requests
       * @example cy.interceptGraphQL('GetCurrentUser', { fixture: 'user.json' })
       */
      interceptGraphQL(operationName: string, response: object): Chainable<void>;
    }
  }
}

// Login via UI
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[placeholder="Email"]').type(email);
  cy.get('input[placeholder="Password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Login via API (faster for authenticated tests)
Cypress.Commands.add('loginViaApi', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}`,
    body: {
      query: `
        mutation Login($email: String!, $password: String!) {
          auth {
            login(email: $email, password: $password) {
              token
              refreshToken
            }
          }
        }
      `,
      variables: { email, password },
    },
  }).then((response) => {
    const { token, refreshToken } = response.body.data.auth.login;
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('refreshToken', refreshToken);
  });
});

// Logout
Cypress.Commands.add('logout', () => {
  cy.clearAuth();
  cy.visit('/login');
});

// Set auth token directly
Cypress.Commands.add('setAuthToken', (token: string) => {
  window.localStorage.setItem('token', token);
});

// Clear all auth data
Cypress.Commands.add('clearAuth', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('refreshToken');
});

// Intercept GraphQL operations by name
Cypress.Commands.add('interceptGraphQL', (operationName: string, response: object) => {
  cy.intercept('POST', '**/api', (req) => {
    if (req.body.query && req.body.query.includes(operationName)) {
      req.reply(response);
    }
  }).as(operationName);
});

export {};
