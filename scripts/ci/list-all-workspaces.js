/*
 * Copyright The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { promises as fs } from 'fs';
import { resolve as resolvePath } from 'path';
import { EOL } from 'os';

import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Optional JSON string array of workspaces, e.g. '["theme", "lightspeed"]'.
// When empty/unset, all workspaces are discovered and returned.
const workspacesInput = process.env.WORKSPACES_INPUT;

async function listAllWorkspaces(workspacesDir) {
  const entries = await fs.readdir(workspacesDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

function parseWorkspacesInput(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `Invalid 'workspaces' input, expected a JSON string array but got: ${raw}`,
    );
  }
  if (
    !Array.isArray(parsed) ||
    parsed.some(value => typeof value !== 'string')
  ) {
    throw new Error(
      `Invalid 'workspaces' input, expected a JSON string array but got: ${raw}`,
    );
  }
  return parsed;
}

async function main() {
  if (!process.env.GITHUB_OUTPUT) {
    throw new Error('GITHUB_OUTPUT environment variable not set');
  }

  const repoRoot = resolvePath(__dirname, '..', '..');
  const workspacesDir = resolvePath(repoRoot, 'workspaces');

  let workspaces;
  if (workspacesInput && workspacesInput.trim()) {
    workspaces = parseWorkspacesInput(workspacesInput.trim());
    console.log('workspaces requested via input:', workspaces);
  } else {
    workspaces = await listAllWorkspaces(workspacesDir);
    console.log('all discovered workspaces:', workspaces);
  }

  // Keep only workspaces that actually exist and have a package.json.
  const existing = [];
  for (const workspace of workspaces) {
    if (
      await fs
        .stat(resolvePath(workspacesDir, workspace, 'package.json'))
        .then(() => true)
        .catch(() => false)
    ) {
      existing.push(workspace);
    } else {
      console.warn(`skipping '${workspace}': no package.json found`);
    }
  }

  if (existing.length === 0) {
    throw new Error('No valid workspaces found to run');
  }

  console.log('workspaces that exist:', existing);

  await fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `workspaces=${JSON.stringify(existing)}${EOL}`,
  );
}

main().catch(error => {
  console.error(error.stack);
  process.exit(1);
});
