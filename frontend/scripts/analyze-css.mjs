import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to find CSS files only in src/pages/app
function findAppCSSFiles() {
  const appDir = path.resolve(__dirname, '../src/pages/app');
  let results = [];

  try {
    const files = fs.readdirSync(appDir);
    files.forEach(file => {
      if (file.endsWith('.css') || file.endsWith('.module.css')) {
        results.push(path.join(appDir, file));
      }
    });
  } catch (error) {
    console.error('Error reading app directory:', error);
  }

  return results;
}

// Problematic patterns to check
const problematicPatterns = {
  hardcodedColors: {
    pattern: /(#[0-9A-Fa-f]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\))/g,
    message: 'Hardcoded color found. Use CSS variables instead.',
    exclude: /(:root|data-theme)/
  },
  hardcodedShadows: {
    pattern: /box-shadow:\s*[^;}]*(rgba|#|\d+px)/g,
    message: 'Hardcoded shadow found. Use CSS variables instead.',
    exclude: /(:root|data-theme)/
  },
  missingTransition: {
    pattern: /(background-color|color|border-color|box-shadow):\s*[^;]*;(?![^}]*transition)/g,
    message: 'Color/background property without transition might cause abrupt theme changes.',
    exclude: /(:root|data-theme)/
  },
  hardcodedBackgrounds: {
    pattern: /background(-color)?:\s*[^;]*(#|rgb|rgba|hsl|hsla|white|black|gray|grey)/gi,
    message: 'Hardcoded background color found. Use CSS variables instead.',
    exclude: /(:root|data-theme)/
  },
  missingThemeVariables: {
    pattern: /:root\s*{[^}]*}/g,
    inverse: true,
    message: 'Missing theme variables definition (:root).'
  },
  missingDarkTheme: {
    pattern: /\[data-theme="dark"\]\s*{[^}]*}/g,
    inverse: true,
    message: 'Missing dark theme override ([data-theme="dark"]).'
  },
  hardcodedBorders: {
    pattern: /border(-\w+)?:\s*[^;]*(#|rgb|rgba|hsl|hsla|white|black|gray|grey)/gi,
    message: 'Hardcoded border color found. Use CSS variables instead.',
    exclude: /(:root|data-theme)/
  },
  hardcodedGradients: {
    pattern: /gradient\([^)]*#[0-9A-Fa-f]{3,8}[^)]*\)/g,
    message: 'Hardcoded gradient colors found. Use CSS variables instead.',
    exclude: /(:root|data-theme)/
  }
};

function analyzeCSS(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const lines = content.split('\n');

    // Check for each problematic pattern
    for (const [key, check] of Object.entries(problematicPatterns)) {
      if (check.inverse) {
        if (!check.pattern.test(content)) {
          issues.push({
            type: key,
            line: 1,
            message: check.message,
            severity: 'error'
          });
        }
        continue;
      }

      lines.forEach((line, index) => {
        if (check.exclude && check.exclude.test(line)) return;
        
        const matches = line.match(check.pattern);
        if (matches) {
          issues.push({
            type: key,
            line: index + 1,
            message: check.message,
            code: line.trim(),
            severity: 'warning'
          });
        }
      });
    }

    return { filePath, issues };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
    return { filePath, error: error.message };
  }
}

// Console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Main execution
console.log(`${colors.bright}🔍 App Pages CSS Theme Analysis${colors.reset}\n`);

// Find all CSS files in the app pages directory
const cssFiles = findAppCSSFiles();
console.log(`${colors.blue}Found ${cssFiles.length} CSS files in app pages directory${colors.reset}\n`);

// Analysis summary
let totalErrors = 0;
let totalWarnings = 0;
const fileResults = [];

// Analyze each file
cssFiles.forEach((file, index) => {
  const fileName = path.basename(file);
  console.log(`${colors.cyan}Analyzing (${index + 1}/${cssFiles.length}): ${fileName}${colors.reset}`);
  
  try {
    const analysis = analyzeCSS(file);
    fileResults.push(analysis);
    
    if (analysis.error) {
      console.error(`${colors.red}Error: ${analysis.error}${colors.reset}`);
      return;
    }

    if (analysis.issues.length === 0) {
      console.log(`${colors.green}✅ No issues found${colors.reset}`);
      return;
    }

    let errorCount = 0;
    let warningCount = 0;

    analysis.issues.forEach(issue => {
      if (issue.severity === 'error') {
        errorCount++;
        totalErrors++;
      }
      if (issue.severity === 'warning') {
        warningCount++;
        totalWarnings++;
      }

      const icon = issue.severity === 'error' ? '❌' : '⚠️';
      const color = issue.severity === 'error' ? colors.red : colors.yellow;
      console.log(`${color}${icon} Line ${issue.line}: ${issue.message}${colors.reset}`);
      if (issue.code) {
        console.log(`   ${colors.dim}Code: ${issue.code}${colors.reset}`);
      }
    });

    console.log(`${colors.bright}Summary: ${errorCount > 0 ? colors.red : ''}${errorCount} errors${colors.reset}${colors.bright}, ${warningCount > 0 ? colors.yellow : ''}${warningCount} warnings${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Failed to analyze ${file}:${colors.reset}`, error);
  }
});

// Print final summary
console.log(`\n${colors.bright}=== Final Analysis Summary ===${colors.reset}`);
console.log(`${colors.bright}Files Analyzed: ${colors.cyan}${cssFiles.length}${colors.reset}`);
console.log(`${colors.red}Total Errors: ${totalErrors}${colors.reset}`);
console.log(`${colors.yellow}Total Warnings: ${totalWarnings}${colors.reset}`);

// Files with most issues
console.log(`\n${colors.bright}Files Needing Attention:${colors.reset}`);
const sortedFiles = fileResults
  .filter(result => result.issues && result.issues.length > 0)
  .sort((a, b) => b.issues.length - a.issues.length);

sortedFiles.forEach(result => {
  const fileName = path.basename(result.filePath);
  console.log(`${colors.cyan}${fileName}${colors.reset}: ${result.issues.length} issues`);
});

// Generate report file
const reportContent = fileResults
  .filter(result => result.issues && result.issues.length > 0)
  .map(result => {
    const fileName = path.basename(result.filePath);
    return `\n## ${fileName}\n` +
      result.issues.map(issue => 
        `- ${issue.severity.toUpperCase()}: Line ${issue.line} - ${issue.message}\n  ${issue.code || ''}`
      ).join('\n');
  }).join('\n');

const reportPath = path.join(__dirname, 'app-css-analysis-report.md');
fs.writeFileSync(reportPath, `# App Pages CSS Analysis Report\n\nGenerated: ${new Date().toLocaleString()}\n${reportContent}`);
console.log(`\n📝 Detailed report saved to: ${colors.cyan}${reportPath}${colors.reset}`);

if (totalErrors > 0 || totalWarnings > 0) {
  console.log(`\n${colors.bright}🔧 Recommended Actions:${colors.reset}`);
  console.log('1. Add theme variables to each file:');
  console.log(`   ${colors.dim}:root {
     --background-default: #FFFFFF;
     --background-paper: #EDE8F5;
     --text-primary: #222222;
     --text-secondary: #333333;
     /* Add more variables */
   }${colors.reset}`);
  console.log('2. Add dark theme override:');
  console.log(`   ${colors.dim}[data-theme="dark"] {
     --background-default: #1C1B29;
     --background-paper: #2A283E;
     --text-primary: #E1E1E6;
     --text-secondary: #A9A9B3;
     /* Override other variables */
   }${colors.reset}`);
  console.log('3. Replace hardcoded values with variables');
  console.log('4. Add transitions for smooth theme switching');
}