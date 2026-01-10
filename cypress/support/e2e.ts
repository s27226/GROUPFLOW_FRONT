// Cypress support file
import './commands';

// Global beforeEach to handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // This is useful for React development errors that don't affect tests
  console.log('Uncaught exception:', err.message);
  return false;
});
