import { describe, it, expect } from 'vitest';
import { GRAPHQL_QUERIES } from '@/queries/graphql';

describe('GraphQL User Queries', () => {
  it('should have GET_CURRENT_USER query', () => {
    expect(GRAPHQL_QUERIES.GET_CURRENT_USER).toBeDefined();
    expect(typeof GRAPHQL_QUERIES.GET_CURRENT_USER).toBe('string');
  });

  it('GET_CURRENT_USER should contain correct query structure', () => {
    const query = GRAPHQL_QUERIES.GET_CURRENT_USER;
    
    expect(query).toContain('query GetCurrentUser');
    expect(query).toContain('users');
    expect(query).toContain('me');
  });

  it('GET_CURRENT_USER should request all necessary user fields', () => {
    const query = GRAPHQL_QUERIES.GET_CURRENT_USER;
    
    expect(query).toContain('id');
    expect(query).toContain('nickname');
    expect(query).toContain('name');
    expect(query).toContain('surname');
    expect(query).toContain('email');
    expect(query).toContain('joined');
    expect(query).toContain('dateOfBirth');
  });

  it('GET_CURRENT_USER should not have any variables', () => {
    const query = GRAPHQL_QUERIES.GET_CURRENT_USER;
    
    // Should not contain variable definitions
    expect(query).not.toContain('$');
  });

  it('GET_USER_BY_ID should still exist and work correctly', () => {
    const query = GRAPHQL_QUERIES.GET_USER_BY_ID;
    
    expect(query).toBeDefined();
    expect(query).toContain('query GetUserById');
    expect(query).toContain('$id: Int!');
    expect(query).toContain('getuserbyid(id: $id)');
  });

  it('should have consistent field selection between GET_CURRENT_USER and GET_USER_BY_ID', () => {
    const currentUserQuery = GRAPHQL_QUERIES.GET_CURRENT_USER;
    const userByIdQuery = GRAPHQL_QUERIES.GET_USER_BY_ID;
    
    // Both should request the same fields
    const fields = ['id', 'nickname', 'name', 'surname', 'email', 'joined', 'dateOfBirth'];
    
    fields.forEach(field => {
      expect(currentUserQuery).toContain(field);
      expect(userByIdQuery).toContain(field);
    });
  });
});
