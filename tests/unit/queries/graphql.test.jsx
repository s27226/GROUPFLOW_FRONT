import { describe, it, expect } from 'vitest';
import { GRAPHQL_QUERIES } from '@/queries/graphql';

describe('GraphQL Queries', () => {
  describe('Query Structure', () => {
    it('should have GET_POSTS query defined', () => {
      expect(GRAPHQL_QUERIES).toHaveProperty('GET_POSTS');
      expect(typeof GRAPHQL_QUERIES.GET_POSTS).toBe('string');
    });

    it('should have GET_TRENDING_PROJECTS query defined', () => {
      expect(GRAPHQL_QUERIES).toHaveProperty('GET_TRENDING_PROJECTS');
      expect(typeof GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toBe('string');
    });
  });

  describe('GET_POSTS Query', () => {
    it('should contain query keyword', () => {
      expect(GRAPHQL_QUERIES.GET_POSTS).toContain('query');
    });

    it('should contain allposts field', () => {
      expect(GRAPHQL_QUERIES.GET_POSTS).toContain('allposts');
    });

    it('should include required fields', () => {
      const query = GRAPHQL_QUERIES.GET_POSTS;
      
      expect(query).toContain('id');
      expect(query).toContain('title');
      expect(query).toContain('content');
      expect(query).toContain('user');
      expect(query).toContain('created');
    });

    it('should include user fields', () => {
      const query = GRAPHQL_QUERIES.GET_POSTS;
      
      expect(query).toContain('nickname');
      expect(query).toContain('name');
      expect(query).toContain('surname');
    });
  });

  describe('GET_TRENDING_PROJECTS Query', () => {
    it('should contain query keyword', () => {
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('query');
    });

    it('should contain trendingprojects field', () => {
      expect(GRAPHQL_QUERIES.GET_TRENDING_PROJECTS).toContain('trendingprojects');
    });

    it('should accept variables', () => {
      const query = GRAPHQL_QUERIES.GET_TRENDING_PROJECTS;
      
      expect(query).toContain('$first');
      expect(query).toContain('Int');
    });

    it('should include project fields', () => {
      const query = GRAPHQL_QUERIES.GET_TRENDING_PROJECTS;
      
      expect(query).toContain('id');
      expect(query).toContain('name');
      expect(query).toContain('description');
      expect(query).toContain('viewCount');
      expect(query).toContain('likeCount');
    });
  });
});
