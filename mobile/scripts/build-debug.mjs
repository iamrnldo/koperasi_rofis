import { execFileSync, execSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mobileDir = path.resolve(here, '..');
const rootDir = path.resolve(mobileDir, '..');
const webDir = path.join(rootDir, 'web');
const androidDir = path.join(mobileDir, 'android');
const apkSource = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const outputDir = path.join(mobileDir, 'output');
const apkOutput = path.join(outputDir, 'koperasi-rofis-debug.apk');

function run(command, cwd) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

try {
  // web/.env must contain VITE_API_URL=http://IP_LAPTOP:3000/api (plain text, no brackets).
  run('npm run build', webDir);
  run('npx cap sync android', mobileDir);
  const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  // ZIP downloads may lose the executable permission on macOS/Linux.
  if (process.platform !== 'win32') chmodSync(path.join(androidDir, 'gradlew'), 0o755);
  console.log('\n> Membuat APK debug...');
  execFileSync(gradle, ['assembleDebug'], { cwd: androidDir, stdio: 'inherit' });
  if (!existsSync(apkSource)) throw new Error('APK debug tidak ditemukan setelah proses build.');
  mkdirSync(outputDir, { recursive: true });
  copyFileSync(apkSource, apkOutput);
  console.log(`\n✓ APK berhasil dibuat:\n${apkOutput}`);
} catch (error) {
  console.error(`\n✗ Build APK gagal: ${error.message || 'Periksa pesan error di atas.'}`);
  process.exit(error.status || 1);
}
