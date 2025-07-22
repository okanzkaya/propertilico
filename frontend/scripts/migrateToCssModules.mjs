// client/scripts/migrateToCssModules.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { globSync } from 'glob';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  // Paths are relative to client/src
  directories: [
    './pages/app',
    './pages/public',
    './components'
  ],
  excludePatterns: [
    '*.module.css',
    'global.css',
    'index.css',
    'node_modules/**',
    'build/**',
    'dist/**'
  ],
  backup: true,
  dryRun: false,
  verbose: true
};

// Helper to resolve paths relative to client/src
function resolveSrcPath(relativePath) {
  return path.join(process.cwd(), 'src', relativePath);
}

// Helper to create backup of files
async function createBackup(filePath) {
  const backupPath = `${filePath}.backup`;
  await fs.copyFile(filePath, backupPath);
  if (CONFIG.verbose) {
    console.log(chalk.yellow(`Created backup: ${backupPath}`));
  }
}

// Convert kebab-case to camelCase
function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Helper to check if import statement exists
function hasStylesImport(content, cssFileName) {
  const importRegex = new RegExp(`import\\s+.*?from\\s+['"].*?${cssFileName}.*?['"]`);
  return importRegex.test(content);
}

// Update CSS class names in a file
async function updateClassNames(content, originalClasses, cssFileName) {
  let updatedContent = content;
  
  // Replace className="something" with className={styles.something}
  originalClasses.forEach(className => {
    const camelCase = kebabToCamel(className);
    
    // Handle standard className="value"
    const regex = new RegExp(`className=['"](${className})(['"])`, 'g');
    updatedContent = updatedContent.replace(regex, `className={styles.${camelCase}}`);
    
    // Handle template literals
    const templateRegex = new RegExp(`className={\`([^}]*?)${className}([^}]*?)\`}`, 'g');
    updatedContent = updatedContent.replace(templateRegex, (match, before, after) => {
      const replacedBefore = before.replace(/(\w+)/g, 'styles.$1');
      const replacedAfter = after.replace(/(\w+)/g, 'styles.$1');
      return `className={\`${replacedBefore}styles.${camelCase}${replacedAfter}\`}`;
    });

    // Handle conditional classes
    const conditionalRegex = new RegExp(`className=\\{([^}]*?)['"]${className}['"]([^}]*?)\\}`, 'g');
    updatedContent = updatedContent.replace(conditionalRegex, (match, before, after) => {
      return `className={${before}styles.${camelCase}${after}}`;
    });
  });

  // Add styles import if not present
  if (!hasStylesImport(updatedContent, cssFileName)) {
    const importStatement = `import styles from './${cssFileName}.module.css';\n`;
    updatedContent = importStatement + updatedContent;
  }

  return updatedContent;
}

// Extract class names from CSS file
function extractClassNames(cssContent) {
  const classRegex = /\.([\w-]+)(?:\s*,\s*\.([\w-]+))*\s*{/g;
  const classes = new Set();
  let match;

  while ((match = classRegex.exec(cssContent)) !== null) {
    // Get all capturing groups and filter out undefined ones
    const capturedClasses = match.slice(1).filter(Boolean);
    capturedClasses.forEach(className => classes.add(className));
  }

  return Array.from(classes);
}

// Process a single component
async function processComponent(jsPath, cssPath) {
  try {
    if (CONFIG.verbose) {
      console.log(chalk.blue(`\nProcessing component: ${path.basename(jsPath)}`));
    }

    // Read files
    const [jsContent, cssContent] = await Promise.all([
      fs.readFile(jsPath, 'utf8'),
      fs.readFile(cssPath, 'utf8')
    ]);

    // Extract class names from CSS
    const originalClasses = extractClassNames(cssContent);
    if (CONFIG.verbose) {
      console.log(chalk.gray('Found classes:', originalClasses.join(', ')));
    }

    // Create new file paths
    const cssFileName = path.basename(cssPath, '.css');
    const newCssPath = cssPath.replace('.css', '.module.css');

    // Create backups if enabled
    if (CONFIG.backup && !CONFIG.dryRun) {
      await Promise.all([
        createBackup(jsPath),
        createBackup(cssPath)
      ]);
    }

    // Update content
    const updatedJsContent = await updateClassNames(jsContent, originalClasses, cssFileName);
    
    if (!CONFIG.dryRun) {
      // Write updated files
      await Promise.all([
        fs.writeFile(jsPath, updatedJsContent),
        fs.writeFile(newCssPath, cssContent),
        fs.unlink(cssPath) // Remove old CSS file
      ]);

      console.log(chalk.green(`✓ Successfully migrated ${path.basename(jsPath)}`));
    } else {
      console.log(chalk.yellow('Dry run - no changes made'));
      console.log('Would update:', path.basename(jsPath));
      console.log('Would create:', path.basename(newCssPath));
      console.log('Would delete:', path.basename(cssPath));
    }

  } catch (error) {
    console.error(chalk.red(`Error processing ${jsPath}:`), error);
    throw error;
  }
}

// Find all component pairs (JS/CSS)
async function findComponentPairs() {
  const pairs = [];

  for (const dir of CONFIG.directories) {
    const fullPath = resolveSrcPath(dir);
    const cssFiles = globSync(`${fullPath}/**/*.css`, {
      ignore: CONFIG.excludePatterns.map(pattern => `${fullPath}/**/${pattern}`)
    });

    for (const cssPath of cssFiles) {
      const baseName = path.basename(cssPath, '.css');
      const dirName = path.dirname(cssPath);
      
      // Look for corresponding JS/JSX/TSX file
      const jsPattern = `${dirName}/${baseName}@(.js|.jsx|.tsx)`;
      const jsFiles = globSync(jsPattern);

      if (jsFiles.length > 0) {
        pairs.push({
          js: jsFiles[0],
          css: cssPath
        });
      } else if (CONFIG.verbose) {
        console.log(chalk.yellow(`Warning: No corresponding JS file found for ${cssPath}`));
      }
    }
  }

  return pairs;
}

// Print summary report
function printSummary(succeeded, failed) {
  console.log('\n' + chalk.cyan('Migration Summary:'));
  console.log(chalk.green(`✓ Successfully migrated: ${succeeded.length} components`));
  
  if (failed.length > 0) {
    console.log(chalk.red(`✗ Failed to migrate: ${failed.length} components`));
    console.log('\nFailed components:');
    failed.forEach(({component, error}) => {
      console.log(chalk.red(`- ${component}: ${error.message}`));
    });
  }

  if (CONFIG.dryRun) {
    console.log(chalk.yellow('\nThis was a dry run. No files were actually modified.'));
  }

  if (CONFIG.backup && !CONFIG.dryRun) {
    console.log(chalk.yellow('\nBackup files created with .backup extension'));
    console.log(chalk.yellow('You can delete them once you verify everything works correctly'));
    console.log(chalk.gray('To restore from backups if needed:'));
    console.log(chalk.gray('find . -name "*.backup" -exec sh -c \'mv "$1" "${1%.backup}"\''));
  }
}

// Validate working directory
function validateWorkingDirectory() {
  const currentDir = process.cwd();
  if (!currentDir.endsWith('client')) {
    console.error(chalk.red('Error: Please run this script from the client directory'));
    process.exit(1);
  }

  // Check if src directory exists
  const srcDir = path.join(currentDir, 'src');
  try {
    fs.access(srcDir);
  } catch {
    console.error(chalk.red('Error: src directory not found in current directory'));
    process.exit(1);
  }
}

// Main migration function
async function migrate() {
  try {
    console.log(chalk.cyan('Starting CSS Modules migration...'));
    console.log(chalk.yellow('Mode:', CONFIG.dryRun ? 'Dry Run' : 'Live'));
    console.log(chalk.blue('Working directory:', process.cwd()));

    validateWorkingDirectory();

    const componentPairs = await findComponentPairs();
    
    if (componentPairs.length === 0) {
      console.log(chalk.yellow('No components found to migrate!'));
      return;
    }

    console.log(chalk.blue(`Found ${componentPairs.length} components to migrate`));

    const succeeded = [];
    const failed = [];

    for (const pair of componentPairs) {
      try {
        await processComponent(pair.js, pair.css);
        succeeded.push(pair.js);
      } catch (error) {
        failed.push({ component: path.basename(pair.js), error });
      }
    }

    printSummary(succeeded, failed);

  } catch (error) {
    console.error(chalk.red('Migration failed:'), error);
    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.includes('--dry-run')) {
    CONFIG.dryRun = true;
  }
  if (args.includes('--no-backup')) {
    CONFIG.backup = false;
  }
  if (args.includes('--quiet')) {
    CONFIG.verbose = false;
  }
  
  // Handle specific directories
  const dirIndex = args.indexOf('--dir');
  if (dirIndex !== -1 && args[dirIndex + 1]) {
    CONFIG.directories = [args[dirIndex + 1]];
  }
}

// Script execution
parseArgs();
migrate();