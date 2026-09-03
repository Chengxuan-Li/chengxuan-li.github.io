/**
 * Runs an npm script (dev, build, …) with the content root pointed at fixtures/content.
 * Usage: node scripts/with-fixtures.mts <npm-script>
 */
import { spawn } from 'node:child_process';

const script = process.argv[2];
if (!script) {
  console.error('Usage: node scripts/with-fixtures.mts <npm-script>');
  process.exit(2);
}

const isWindows = process.platform === 'win32';
const child = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', script], {
  stdio: 'inherit',
  shell: isWindows,
  env: { ...process.env, SITE_CONTENT_ROOT: 'fixtures/content' },
});
child.on('exit', (code) => process.exit(code ?? 1));
