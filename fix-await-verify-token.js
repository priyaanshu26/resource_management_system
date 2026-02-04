// Script to add await to all verifyToken calls
// Run: node fix-await-verify-token.js

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1: const payload = verifyToken(token);
    const pattern1 = /const payload = verifyToken\(token\);/g;
    if (pattern1.test(content)) {
        content = content.replace(pattern1, 'const payload = await verifyToken(token);');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
    }
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.stat SyncullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (file.endsWith('.ts') && fullPath.includes('app/api')) {
            processFile(fullPath);
        }
    }
}

// Start from project root
const apiDir = path.join(__dirname, '../app/api');
scanDirectory(apiDir);

console.log('Done fixing await verifyToken calls!');
