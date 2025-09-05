import test from 'node:test';
import { strictEqual } from 'node:assert';
import { postKey, POSTS_ALL_KEY, POSTS_TTL_SECONDS } from '../utils';

test('postKey returns Redis key with id', () => {
  strictEqual(postKey(5), 'posts:id:5');
});

test('POSTS_ALL_KEY is constant', () => {
  strictEqual(POSTS_ALL_KEY, 'posts:all');
});

test('POSTS_TTL_SECONDS is positive number', () => {
  strictEqual(typeof POSTS_TTL_SECONDS, 'number');
});
