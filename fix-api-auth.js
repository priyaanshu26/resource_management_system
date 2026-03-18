import fs from 'fs';
import path from 'path';

const apiDir = 'e:/Darshan University/Sem-6/Advance_WebTechnology/Project/rms/app/api';

function getAllRoutes(dir) {
    let routes = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            routes = routes.concat(getAllRoutes(fullPath));
        } else if (file === 'route.ts') {
            routes.push(fullPath);
        }
    }
    return routes;
}

const routes = getAllRoutes(apiDir);

for (const route of routes) {
    if (route.includes('auth\\login') || route.includes('auth\\register')) continue;
    
    let content = fs.readFileSync(route, 'utf-8');
    
    // Replace import
    if (content.includes("from '@/lib/auth'")) {
        content = content.replace(/import { (.*) } from '@\/lib\/auth'/g, (match, p1) => {
            let imports = p1.split(',').map(s => s.trim());
            if (!imports.includes('getAuthUser')) {
                imports.push('getAuthUser');
            }
            return `import { ${imports.join(', ')} } from '@/lib/auth'`;
        });
    } else {
        content = "import { getAuthUser } from '@/lib/auth';\n" + content;
    }

    // Replace token and payload logic
    content = content.replace(
        /const token = request.cookies.get\('token'\)\?.value;\s*if \(!token\) {\s*return NextResponse.json\({ error: 'Unauthorized' }, { status: 401 }\);\s*}\s*const payload = await verifyToken\(token\);/g,
        'const payload = await getAuthUser(request);'
    );
    
    content = content.replace(
        /if \(!payload \|\| payload.role !== 'ADMIN'\) {\s*return NextResponse.json\({ error: 'Forbidden' }, { status: 403 }\);\s*}/g,
        "if (!payload || payload.role !== 'ADMIN') { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }"
    );

    fs.writeFileSync(route, content);
    console.log(`Updated ${route}`);
}
