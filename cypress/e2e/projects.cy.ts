/// <reference types="cypress" />

describe('Projects', () => {
  const mockUser = {
    id: '1',
    nickname: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    profilePic: null
  };

  const mockProjects = [
    {
      id: 1,
      name: 'Test Project',
      description: 'A test project description',
      imageUrl: null,
      bannerUrl: null,
      isPublic: true,
      owner: mockUser,
      collaborators: [],
      skills: [{ id: 1, skillName: 'React' }],
      interests: [{ id: 1, interestName: 'Web Development' }]
    },
    {
      id: 2,
      name: 'Private Project',
      description: 'This is a private project',
      imageUrl: 'https://picsum.photos/200',
      bannerUrl: 'https://picsum.photos/900/200',
      isPublic: false,
      owner: mockUser,
      collaborators: [
        {
          user: { id: 2, nickname: 'collaborator', name: 'Collab', profilePic: null },
          role: 'Developer'
        }
      ],
      skills: [],
      interests: []
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
      } else if (query.includes('myprojects') || query.includes('userprojects')) {
        req.reply({
          body: {
            data: {
              project: {
                myprojects: mockProjects
              }
            }
          }
        });
      } else if (query.includes('projectbyid')) {
        const projectId = req.body.variables?.id || 1;
        const project = mockProjects.find(p => p.id === projectId) || mockProjects[0];
        req.reply({
          body: {
            data: {
              project: {
                projectbyid: [project]
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
                  nodes: mockProjects,
                  totalCount: mockProjects.length
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

  describe('My Projects Page', () => {
    it('should display the projects list page', () => {
      cy.visit('/myprojects');
      
      // Should show projects
      cy.contains('Test Project').should('be.visible');
      cy.contains('Private Project').should('be.visible');
    });

    it('should show project cards with details', () => {
      cy.visit('/myprojects');
      
      cy.get('[class*="project"]').first().within(() => {
        cy.contains('Test Project').should('be.visible');
        cy.contains('A test project description').should('be.visible');
      });
    });

    it('should have create project button', () => {
      cy.visit('/myprojects');
      
      cy.get('button, a').contains(/create|new project|add/i).should('be.visible');
    });

    it('should navigate to project details on click', () => {
      cy.visit('/myprojects');
      
      cy.contains('Test Project').click();
      
      cy.url().should('include', '/project');
    });
  });

  describe('Project Profile Page', () => {
    it('should display project profile with all details', () => {
      cy.visit('/project/1');
      
      // Project name
      cy.contains('Test Project').should('be.visible');
      
      // Description
      cy.contains('A test project description').should('be.visible');
    });

    it('should show project banner and image', () => {
      cy.visit('/project/2');
      
      // Check for banner
      cy.get('[class*="banner"], [class*="header"] img').should('be.visible');
    });

    it('should show project members', () => {
      cy.visit('/project/2');
      
      // Owner should be listed
      cy.contains('testuser').should('be.visible');
      
      // Collaborator should be listed
      cy.contains('collaborator').should('be.visible');
    });

    it('should show edit button for owner', () => {
      cy.visit('/project/1');
      
      cy.get('button, a').contains(/edit/i).should('be.visible');
    });

    it('should display project skills and interests', () => {
      cy.visit('/project/1');
      
      cy.contains('React').should('be.visible');
      cy.contains('Web Development').should('be.visible');
    });
  });

  describe('Project View Page (Chat/Files/Termins)', () => {
    it('should display project view with tabs', () => {
      cy.visit('/projectview/1');
      
      // Tab navigation
      cy.contains(/files/i).should('be.visible');
      cy.contains(/messages|chat/i).should('be.visible');
      cy.contains(/termins|calendar|events/i).should('be.visible');
    });

    it('should switch between tabs', () => {
      cy.visit('/projectview/1');
      
      // Click files tab
      cy.contains(/files/i).click();
      cy.get('[class*="files"], [class*="file-list"]').should('be.visible');
      
      // Click messages tab
      cy.contains(/messages|chat/i).click();
      cy.get('[class*="chat"], [class*="message"]').should('be.visible');
    });

    it('should show back button', () => {
      cy.visit('/projectview/1');
      
      cy.get('button, a').contains(/back/i).should('be.visible');
    });
  });

  describe('Create Project', () => {
    it('should navigate to create project page', () => {
      cy.visit('/myprojects');
      
      cy.get('button, a').contains(/create|new project|add/i).click();
      
      cy.url().should('include', '/createproject');
    });

    it('should display project creation form', () => {
      cy.visit('/createproject');
      
      // Form fields
      cy.get('input[placeholder*="name" i], input[name="name"]').should('be.visible');
      cy.get('textarea[placeholder*="description" i], textarea[name="description"]').should('be.visible');
    });

    it('should create a new project', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('CreateProject') || req.body.query?.includes('createproject')) {
          req.reply({
            body: {
              data: {
                project: {
                  createproject: {
                    id: 999,
                    name: 'New Test Project',
                    description: 'New project description'
                  }
                }
              }
            }
          });
        }
      }).as('createProject');

      cy.visit('/createproject');
      
      cy.get('input[placeholder*="name" i], input[name="name"]').type('New Test Project');
      cy.get('textarea[placeholder*="description" i], textarea[name="description"]').type('New project description');
      
      cy.get('button[type="submit"], button').contains(/create|save|submit/i).click();
    });
  });

  describe('Edit Project', () => {
    it('should navigate to edit project page', () => {
      cy.visit('/project/1');
      
      cy.get('button, a').contains(/edit/i).click();
      
      cy.url().should('include', '/editproject');
    });

    it('should display project edit form with existing data', () => {
      cy.visit('/editproject/1');
      
      // Form should be pre-filled
      cy.get('input[placeholder*="name" i], input[name="name"]')
        .should('have.value', 'Test Project');
    });

    it('should save project changes', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('UpdateProject') || req.body.query?.includes('updateproject')) {
          req.reply({
            body: {
              data: {
                project: {
                  updateproject: {
                    id: 1,
                    name: 'Updated Project Name'
                  }
                }
              }
            }
          });
        }
      }).as('updateProject');

      cy.visit('/editproject/1');
      
      cy.get('input[placeholder*="name" i], input[name="name"]')
        .clear()
        .type('Updated Project Name');
      
      cy.get('button[type="submit"], button').contains(/save|update|submit/i).click();
    });

    it('should handle delete project', () => {
      cy.intercept('POST', '**/api', (req) => {
        if (req.body.query?.includes('DeleteProject') || req.body.query?.includes('deleteproject')) {
          req.reply({
            body: {
              data: {
                project: {
                  deleteproject: true
                }
              }
            }
          });
        }
      }).as('deleteProject');

      cy.visit('/editproject/1');
      
      cy.get('button').contains(/delete/i).click();
      
      // Confirmation dialog
      cy.get('[class*="confirm"], [class*="dialog"], [role="dialog"]').within(() => {
        cy.get('button').contains(/confirm|yes|delete/i).click();
      });
    });
  });
});
