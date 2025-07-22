// client/scripts/fixCssImports.mjs
import fs from 'fs/promises';
import { globSync } from 'glob';
import path from 'path';

async function fixImports() {
  const directories = ['./src/pages/app', './src/pages/public'];
  
  for (const dir of directories) {
    const jsFiles = globSync(`${dir}/**/*.js`);
    
    for (const file of jsFiles) {
      try {
        let content = await fs.readFile(file, 'utf8');
        
        // Replace CSS imports with module imports
        content = content.replace(
          /import\s+['"]\.\/([^'"]+)\.css['"]/g,
          "import styles from './$1.module.css'"
        );
        
        // Add styles import if it's using styles but doesn't have import
        if (content.includes('styles.') && !content.includes('import styles from')) {
          const baseName = path.basename(file, '.js');
          content = `import styles from './${baseName}.module.css';\n${content}`;
        }
        
        await fs.writeFile(file, content);
        console.log(`✓ Fixed imports in ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
}

fixImports();