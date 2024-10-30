import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to look for
const patterns = {
  stringLiteralStyles: /className=\{`styles\.(.*?)`\}/g,
  multipleStylesIncorrect: /className=\{`styles\.(.*?)\s+styles\.(.*?)`\}/g,
  styleWithoutModule: /className=["'](.*?)["']/g,
  missingStylesImport: /className=\{styles\./,
  incorrectStylesConcatenation: /className=\{styles\.(.*?)\s*\+\s*styles\.(.*?)\}/g
};

// Helper to check if file has styles import
async function hasStylesImport(content) {
  return content.includes("import styles from") || 
         content.includes("import styles from");
}

async function checkFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const issues = [];
    const fileName = path.basename(filePath);

    // Check for styles import if styles are used
    if (content.includes('className={styles.') && !await hasStylesImport(content)) {
      issues.push({
        type: 'missing-import',
        message: 'Uses styles object but missing styles import'
      });
    }

    // Check for incorrect string literal usage
    const stringLiteralMatch = content.match(patterns.stringLiteralStyles);
    if (stringLiteralMatch) {
      issues.push({
        type: 'string-literal',
        message: 'Incorrect string literal usage with styles',
        matches: stringLiteralMatch
      });
    }

    // Check for incorrect multiple styles combination
    const multipleStylesMatch = content.match(patterns.multipleStylesIncorrect);
    if (multipleStylesMatch) {
      issues.push({
        type: 'multiple-styles',
        message: 'Incorrect multiple styles combination',
        matches: multipleStylesMatch
      });
    }

    // Check for non-module style usage while using CSS modules
    const nonModuleMatch = content.match(patterns.styleWithoutModule);
    if (nonModuleMatch && await hasStylesImport(content)) {
      issues.push({
        type: 'non-module-style',
        message: 'Mixed usage of CSS modules and regular className strings',
        matches: nonModuleMatch
      });
    }

    // Check for incorrect style concatenation
    const concatenationMatch = content.match(patterns.incorrectStylesConcatenation);
    if (concatenationMatch) {
      issues.push({
        type: 'concatenation',
        message: 'Incorrect style concatenation',
        matches: concatenationMatch
      });
    }

    if (issues.length > 0) {
      return {
        file: fileName,
        path: filePath,
        issues
      };
    }
  } catch (err) {
    console.error(chalk.red(`Error processing ${filePath}:`), err);
  }
  return null;
}

async function generateFix(issue) {
  switch (issue.type) {
    case 'string-literal':
      return issue.matches.map(match => {
        const original = match;
        const fixed = match.replace(/`styles\.(.*?)`/, 'styles.$1');
        return { original, fixed };
      });
    
    case 'multiple-styles':
      return issue.matches.map(match => {
        const original = match;
        const classes = match.match(/styles\.(\w+)/g);
        const fixed = `className={${classes.join(' ')}}`; 
        return { original, fixed };
      });
    
    case 'non-module-style':
      return issue.matches.map(match => {
        const original = match;
        const className = match.match(/["'](.*?)["']/)[1];
        const fixed = `className={styles.${className}}`;
        return { original, fixed };
      });
    
    default:
      return null;
  }
}

async function scanDirectory(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const issues = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        const subDirIssues = await scanDirectory(fullPath);
        issues.push(...subDirIssues);
      } else if (
        entry.isFile() && 
        /\.(jsx?|tsx)$/.test(entry.name) && 
        !entry.name.includes('.test.') && 
        !entry.name.includes('.spec.')
      ) {
        const fileIssues = await checkFile(fullPath);
        if (fileIssues) {
          issues.push(fileIssues);
        }
      }
    }

    return issues;
  } catch (err) {
    console.error(chalk.red('Error scanning directory:'), err);
    return [];
  }
}

async function main() {
  console.log(chalk.blue('Scanning for CSS Modules issues...'));
  
  const srcDir = path.join(__dirname, '../src');
  const issues = await scanDirectory(srcDir);

  if (issues.length === 0) {
    console.log(chalk.green('✓ No issues found!'));
    return;
  }

  console.log(chalk.yellow(`Found issues in ${issues.length} files:\n`));

  for (const fileIssue of issues) {
    console.log(chalk.white.bold(`File: ${fileIssue.path}`));
    
    for (const issue of fileIssue.issues) {
      console.log(chalk.yellow(`  ⚠ ${issue.message}`));
      
      const fixes = await generateFix(issue);
      if (fixes) {
        fixes.forEach(fix => {
          console.log(chalk.red(`    Original: ${fix.original}`));
          console.log(chalk.green(`    Fix to: ${fix.fixed}\n`));
        });
      }
    }
    console.log('');
  }

  console.log(chalk.blue('Tips for fixing:'));
  console.log('1. Use styles.className instead of `styles.className`');
  console.log('2. For multiple classes use: className={`${styles.class1} ${styles.class2}`}');
  console.log('3. Make sure to import styles from the corresponding .module.css file');
  console.log('4. Don\'t mix regular classNames with CSS Modules');
}

main().catch(console.error);