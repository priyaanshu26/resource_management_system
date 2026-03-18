// Script to add await to ALL verifyToken calls in API routes
// Run: node fix-all-awaits.js

const fs = require('fs');
const path = require('path');

let totalFixed = 0;
let filesModified = 0;

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = content;
    let changeCount = 0;

    // Replace all instances of "const [varname] = verifyToken(" with "const [varname] = await verifyToken("
    // But only if it doesn't already have await before it
    const lines = modified.split('\n');
    const newLines = lines.map(line => {
        if (line.includes('= verifyToken(') && !line.includes('await verifyToken(')) {
            changeCount++;
            return line.replace(/= verifyToken\(/g, '= await verifyToken(');
        }
        return line;
    });

    if (changeCount > 0) {
        const newContent = newLines.join('\n');
        fs.writeFileSync(filePath, newContent);
        console.log(`✓ ${path.relative(process.cwd(), filePath)}: Fixed ${changeCount} call(s)`);
        filesModified++;
        totalFixed += changeCount;
        return true;
    }
    return false;
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (file.endsWith('.ts') && fullPath.includes('app\\api')) {
            processFile(fullPath);
        }
    }
}

console.log('Adding await to all verifyToken calls...\n');
const apiDir = path.join(__dirname, 'app');
scanDirectory(apiDir);
console.log(`\n✅ Done! Fixed ${totalFixed} verifyToken call(s) in ${filesModified} file(s)`);
