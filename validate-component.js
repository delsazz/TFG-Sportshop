#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the AdminUsers.tsx file
const componentPath = path.join(__dirname, 'frontend/src/components/AdminUsers.tsx');
const componentContent = fs.readFileSync(componentPath, 'utf-8');

// Validation checks
const checks = [
  {
    name: 'Has exportUsersToCSV import',
    pattern: /import.*exportUsersToCSV.*from.*csvExporter/,
  },
  {
    name: 'Has searchTerm state',
    pattern: /const \[searchTerm, setSearchTerm\]/,
  },
  {
    name: 'Has selectedRoleFilter state',
    pattern: /const \[selectedRoleFilter, setSelectedRoleFilter\]/,
  },
  {
    name: 'Has debouncedSearchTerm state',
    pattern: /const \[debouncedSearchTerm, setDebouncedSearchTerm\]/,
  },
  {
    name: 'Has filteredUsuarios function',
    pattern: /const filteredUsuarios = useCallback\(\(\) => \{/,
  },
  {
    name: 'Has handleClearFilters function',
    pattern: /function handleClearFilters\(\)/,
  },
  {
    name: 'Has handleExportCSV function',
    pattern: /function handleExportCSV\(\)/,
  },
  {
    name: 'Has debounce effect for search',
    pattern: /useEffect\(\(\) => \{[\s\S]*const timer = setTimeout\(\(\) => \{[\s\S]*setDebouncedSearchTerm\(searchTerm\)/,
  },
  {
    name: 'Uses filtered.map in table',
    pattern: /filtered\.map\(\(usuario\) => \(/,
  },
  {
    name: 'Uses filtered.length for stats',
    pattern: /Mostrando.*\{filtered\.length\}.*de.*\{usuarios\.length\}/,
  },
  {
    name: 'Has filter section with search input',
    pattern: /placeholder="Buscar por nombre, apellidos o email/,
  },
  {
    name: 'Has role filter dropdown',
    pattern: /Todos los roles/,
  },
  {
    name: 'Has empty state for no users',
    pattern: /No hay usuarios/,
  },
  {
    name: 'Has Download icon import',
    pattern: /Download.*from.*lucide-react/,
  },
  {
    name: 'Has Search icon import',
    pattern: /Search.*from.*lucide-react/,
  },
  {
    name: 'Has Filter icon import',
    pattern: /Filter.*from.*lucide-react/,
  },
  {
    name: 'CSV export button exists',
    pattern: /Exportar CSV/,
  },
  {
    name: 'Has header-actions div',
    pattern: /<div className="header-actions">/,
  },
  {
    name: 'Has filter-section div',
    pattern: /<div className="filter-section">/,
  },
  {
    name: 'Has empty-state div',
    pattern: /<div className="empty-state">/,
  },
];

let passed = 0;
let failed = 0;

console.log('Validating AdminUsers.tsx component...\n');

checks.forEach((check) => {
  if (check.pattern.test(componentContent)) {
    console.log(`✓ ${check.name}`);
    passed++;
  } else {
    console.log(`✗ ${check.name}`);
    failed++;
  }
});

console.log(`\n${passed} checks passed, ${failed} checks failed`);

if (failed === 0) {
  console.log('\n✓ All validation checks passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some validation checks failed');
  process.exit(1);
}
