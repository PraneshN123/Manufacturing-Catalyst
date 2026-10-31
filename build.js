const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client');
const destDir = path.join(__dirname, 'dist');

console.log('[Build] Starting build process for Zoho Catalyst Slate Deployer...');
console.log(`[Build] Source: ${srcDir}`);
console.log(`[Build] Destination: ${destDir}`);

// Ensure dist directory exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Copy all files from client to dist
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name === '.catalyst' || entry.name.startsWith('.')) continue;

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            const size = (fs.statSync(destPath).size / 1024).toFixed(1);
            console.log(`[Build] Copied ${entry.name} (${size} KB) -> dist/`);
        }
    }
}

copyDir(srcDir, destDir);
console.log('[Build] ✓ Build completed successfully! Output directory "dist" is ready for deployment.');
