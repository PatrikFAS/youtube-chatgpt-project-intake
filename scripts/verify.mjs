import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const manifestPath = path.join(root, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const errors = [];
const requiredPermissions = new Set(['activeTab', 'storage', 'clipboardWrite']);
const forbidden = new Set(['<all_urls>', 'history', 'downloads', 'cookies', 'debugger']);

if (manifest.manifest_version !== 3) errors.push('manifest_version must be 3.');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (manifest.version !== pkg.version) errors.push(`manifest version ${manifest.version} does not match package version ${pkg.version}.`);

for (const permission of manifest.permissions || []) {
  if (forbidden.has(permission)) errors.push(`Forbidden permission: ${permission}`);
}
for (const required of requiredPermissions) {
  if (!(manifest.permissions || []).includes(required)) errors.push(`Missing expected permission: ${required}`);
}
for (const host of manifest.host_permissions || []) {
  if (host.includes('<all_urls>')) errors.push('Broad host permission detected.');
  if (!host.includes('youtube.com') && !host.includes('chatgpt.com')) errors.push(`Unexpected host permission: ${host}`);
}

const referenced = new Set();
referenced.add(manifest.background?.service_worker);
referenced.add(manifest.action?.default_popup);
referenced.add(manifest.options_page);
for (const content of manifest.content_scripts || []) for (const file of content.js || []) referenced.add(file);
for (const group of manifest.web_accessible_resources || []) for (const file of group.resources || []) referenced.add(file);
for (const file of Object.values(manifest.icons || {})) referenced.add(file);
for (const file of Object.values(manifest.action?.default_icon || {})) referenced.add(file);

for (const file of referenced) {
  if (!file) continue;
  if (!fs.existsSync(path.join(root, file))) errors.push(`Manifest references missing file: ${file}`);
}

const jsFiles = [];
walk(root, (file) => { if (file.endsWith('.js') || file.endsWith('.mjs')) jsFiles.push(file); });
for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (error) {
    errors.push(`JavaScript syntax check failed: ${path.relative(root, file)}\n${error.stderr?.toString() || error.message}`);
  }
}

if (errors.length) {
  console.error('\nVERIFY FAILED\n');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`VERIFY OK: Manifest V3, narrow permissions, ${jsFiles.length} JavaScript files syntax-checked.`);

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, callback);
    else callback(full);
  }
}
