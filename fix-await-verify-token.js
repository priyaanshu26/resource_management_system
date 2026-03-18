// Script to add await to all verifyToken calls
// Run: node fix-await-verify-token.js

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1: const payload = verifyToken(token);
    const pattern1 = /const payload = verifyToken\(token\);/g;
    const matches1 = [...content.matchAll(pattern1)];
    if (matches1.length > 0) {
        content = content.replace(pattern1, 'const payload = await verifyToken(token);');
        console.log(`  - Fixed ${matches1.length} verifyToken call(s)`);
        modified = true;
    }

    // Pattern 2: const result = verifyToken(...) or any variable = verifyToken(...)
    const pattern2 = /const (\w+) = verifyToken\(/g;
    const matches2 = [...content.matchAll(pattern2)];
    for (const match of matches2) {
        // Check if it already has await
        const beforeMatch = content.substring(Math.max(0, match.index - 10), match.index);
        if (!beforeMatch.includes('await')) {
            const original = match[0];
            const varName = match[1];
            const replacement = `const ${varName} = await verifyToken(`;
            content = content.replace(original, replacement);
            console.log(`  - Added await to verifyToken for variable: ${varName}`);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✓ Fixed: ${filePath}`);
    }
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (file.endsWith('.ts') && fullPath.includes('app/api')) {
            processFile(fullPath);
        }
    }
}

// Start from project root
const apiDir = path.join(__dirname, 'app/api');
scanDirectory(apiDir);

console.log('Done fixing await verifyToken calls!');
