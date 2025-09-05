import test from 'node:test';
import { strict as assert } from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'Header.tsx');

const source = fs.readFileSync(filePath, 'utf8');

test('header component contains Login link', () => {
  assert(source.includes('Login'));
});
