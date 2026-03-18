// Script to fix params in Next.js 15 dynamic routes
// Run: node fix-params.js

const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Pattern 1: Fix params type from { params: { id: string } } to { params: Promise<{ id: string }> }
    const typePattern = /\{\s*params\s*\}\s*:\s*\{\s*params:\s*\{\s*id:\s*string\s*\}\s*\}/g;
    const matches = content.match(typePattern);
    if (matches && matches.length > 0) {
        content = content.replace(typePattern, '{ params }: { params: Promise<{ id: string }> }');
        console.log(`  - Updated ${matches.length} params type(s)`);
        modified = true;
    }

    // Pattern 2: Fix params.id with parseInt - need to await params first
    const parseIntPattern = /(\s+)const id = parseInt\(params\.id\);/g;
    let parseIntMatches = [...content.matchAll(parseIntPattern)];
    if (parseIntMatches.length > 0) {
        for (const match of parseIntMatches) {
            const indent = match[1];
            const original = match[0];
            const replacement = `${indent}const { id: idParam } = await params;
${indent}const id = parseInt(idParam);`;
            content = content.replace(original, replacement);
        }
        console.log(`  - Fixed ${parseIntMatches.length} parseInt(params.id) call(s)`);
        modified = true;
    }

    // Pattern 3: Fix direct params.id string usage
    const directPattern = /(\s+)const id = params\.id;/g;
    let directMatches = [...content.matchAll(directPattern)];
    if (directMatches.length > 0) {
        for (const match of directMatches) {
            const indent = match[1];
            const original = match[0];
            const replacement = `${indent}const { id } = await params;`;
            content = content.replace(original, replacement);
        }
        console.log(`  - Fixed ${directMatches.length} direct params.id access(es)`);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✓ Fixed: ${filePath}`);
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
        } else if (file === 'route.ts' && fullPath.includes('[id]')) {
            processFile(fullPath);
        }
    }
}

// Start from app/api
const apiDir = path.join(__dirname, 'app/api');
console.log('Fixing params in dynamic routes...');
scanDirectory(apiDir);
console.log('Done fixing params in Next.js 15 dynamic routes!');
