import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Convert kebab-case to camelCase
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Convert class names in CSS file
async function convertCssFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Convert class selectors
    const convertedCss = content.replace(/\.([\w-]+)/g, (match, className) => {
      if (className.includes(':') || !className.includes('-')) {
        return match;
      }
      return '.' + kebabToCamel(className);
    });
    
    await fs.writeFile(filePath, convertedCss);
    console.log(`✓ Converted CSS: ${filePath}`);
  } catch (err) {
    console.error(`× Error converting CSS file: ${filePath}`, err);
  }
}

// Convert className in JSX/TSX file
async function convertJsxFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    const cssModulePath = filePath.replace(/\.(jsx?|tsx)$/, '.module.css');
    const cssModuleExists = await fs.access(cssModulePath).then(() => true).catch(() => false);
    
    if (cssModuleExists && !content.includes("import styles from")) {
      content = `import styles from '${path.basename(cssModulePath)}';\n${content}`;
    }

    content = content.replace(/className=["'](.*?)["']/g, (match, classNames) => {
      const convertedClasses = classNames.split(' ').map(className => {
        if (className.includes('styles.')) return className;
        return `styles.${kebabToCamel(className)}`;
      });
      
      return `className={${convertedClasses.length > 1 ? 
        '`' + convertedClasses.join(' ') + '`' : 
        convertedClasses[0]}}`;
    });

    await fs.writeFile(filePath, content);
    console.log(`✓ Converted JSX: ${filePath}`);
  } catch (err) {
    console.error(`× Error converting JSX file: ${filePath}`, err);
  }
}

// Recursively process directory
async function processDirectory(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await processDirectory(fullPath);
      } else if (entry.isFile()) {
        if (/\.module\.css$/.test(entry.name)) {
          await convertCssFile(fullPath);
        } else if (/\.(jsx?|tsx)$/.test(entry.name)) {
          await convertJsxFile(fullPath);
        }
      }
    }
  } catch (err) {
    console.error('× Error processing directory:', dir, err);
  }
}

// Main function
async function main() {
  const srcDir = path.join(__dirname, '../src');
  console.log('Starting CSS Modules conversion...');
  await processDirectory(srcDir);
  console.log('Conversion complete!');
}

main().catch(console.error);