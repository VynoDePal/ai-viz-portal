import { describe, it, expect } from 'vitest';
import type { Organization, Category, Model, Benchmark, BenchmarkResult, UserProfile } from '@/types';

describe('TypeScript Types', () => {
  describe('Organization', () => {
    it('should have required fields', () => {
      const org: Organization = {
        id: 'test-id',
        name: 'Test Organization',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(org.id).toBe('test-id');
      expect(org.name).toBe('Test Organization');
    });

    it('should have optional fields', () => {
      const org: Organization = {
        id: 'test-id',
        name: 'Test Organization',
        website: 'https://example.com',
        description: 'Test description',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(org.website).toBe('https://example.com');
      expect(org.description).toBe('Test description');
    });
  });

  describe('Category', () => {
    it('should have required fields', () => {
      const category: Category = {
        id: 'test-id',
        name: 'LLM',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(category.name).toBe('LLM');
    });
  });

  describe('Model', () => {
    it('should have required fields', () => {
      const model: Model = {
        id: 'test-id',
        name: 'GPT-4',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(model.name).toBe('GPT-4');
    });

    it('should have optional fields', () => {
      const model: Model = {
        id: 'test-id',
        name: 'GPT-4',
        organization_id: 'org-id',
        category_id: 'cat-id',
        parameters: 1760000000000,
        release_date: '2023-03-14',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(model.parameters).toBe(1760000000000);
      expect(model.release_date).toBe('2023-03-14');
    });
  });

  describe('Benchmark', () => {
    it('should have required fields', () => {
      const benchmark: Benchmark = {
        id: 'test-id',
        name: 'MMLU',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(benchmark.name).toBe('MMLU');
    });

    it('should have optional fields', () => {
      const benchmark: Benchmark = {
        id: 'test-id',
        name: 'MMLU',
        description: 'Massive Multitask Language Understanding',
        type: 'knowledge',
        unit: 'accuracy',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(benchmark.type).toBe('knowledge');
      expect(benchmark.unit).toBe('accuracy');
    });
  });

  describe('BenchmarkResult', () => {
    it('should have required fields', () => {
      const result: BenchmarkResult = {
        id: 'test-id',
        model_id: 'model-id',
        benchmark_id: 'benchmark-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(result.model_id).toBe('model-id');
      expect(result.benchmark_id).toBe('benchmark-id');
    });

    it('should have optional fields', () => {
      const result: BenchmarkResult = {
        id: 'test-id',
        model_id: 'model-id',
        benchmark_id: 'benchmark-id',
        score: 86.4,
        date_recorded: '2024-01-01',
        source: 'OpenAI',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(result.score).toBe(86.4);
      expect(result.source).toBe('OpenAI');
    });
  });

  describe('UserProfile', () => {
    it('should have required fields', () => {
      const profile: UserProfile = {
        id: 'test-id',
        user_id: 'user-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(profile.user_id).toBe('user-id');
    });

    it('should have optional fields', () => {
      const profile: UserProfile = {
        id: 'test-id',
        user_id: 'user-id',
        full_name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(profile.full_name).toBe('John Doe');
      expect(profile.avatar_url).toBe('https://example.com/avatar.jpg');
    });
  });
});
