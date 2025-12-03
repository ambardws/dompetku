# SonarQube Setup Guide - Dompetku

## 📋 Prerequisites

1. **SonarQube Server** running (local or cloud)
   - Local: http://localhost:9000
   - Cloud: https://sonarcloud.io

2. **SonarQube Scanner** installed
   - Download: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/
   - Or use Docker

3. **Project Token** from SonarQube
   - Generate in: My Account → Security → Generate Tokens

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev @vitest/coverage-v8
```

### 2. Run Tests with Coverage

```bash
npm run test:coverage
```

This will generate:
- `coverage/lcov.info` - Coverage data for SonarQube
- `coverage/index.html` - HTML coverage report

### 3. Run SonarQube Analysis

#### Option A: Using SonarQube Scanner

```bash
# Set your token
$env:SONAR_TOKEN="your-sonarqube-token"

# Run scanner
sonar-scanner `
  -Dsonar.host.url=http://localhost:9000 `
  -Dsonar.login=$env:SONAR_TOKEN
```

#### Option B: Using Docker

```bash
docker run --rm `
  -e SONAR_HOST_URL="http://host.docker.internal:9000" `
  -e SONAR_LOGIN="your-token" `
  -v "${PWD}:/usr/src" `
  sonarsource/sonar-scanner-cli
```

#### Option C: Using npm script (recommended)

```bash
npm run sonar
```

## 📊 Configuration Files

### `sonar-project.properties`
Main configuration file with:
- Project key and name
- Source and test paths
- Coverage report location
- Exclusions

### `vitest.config.ts`
Updated with coverage settings:
- Provider: v8
- Reporters: text, lcov, html
- Exclusions for config files

## 🔧 SonarQube Project Setup

### 1. Create Project in SonarQube

1. Login to SonarQube
2. Click "Create Project"
3. Set Project Key: `dompetku`
4. Set Project Name: `Dompetku - Personal Finance Manager`
5. Generate Token

### 2. Configure Quality Gate (Optional)

Recommended settings:
- Coverage: > 80%
- Duplications: < 3%
- Maintainability Rating: A
- Reliability Rating: A
- Security Rating: A

## 📈 Viewing Results

After running analysis:

1. **Dashboard**: http://localhost:9000/dashboard?id=dompetku
2. **Coverage**: Check coverage percentage and uncovered lines
3. **Code Smells**: Review code quality issues
4. **Bugs**: Check for potential bugs
5. **Security**: Review security hotspots

## 🎯 CI/CD Integration

### GitHub Actions

```yaml
name: SonarQube Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

### Netlify (Post-deploy)

Add to `netlify.toml`:
```toml
[build.environment]
  SONAR_TOKEN = "your-token"

[[plugins]]
  package = "netlify-plugin-sonarqube"
```

## 📝 npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "sonar": "sonar-scanner",
    "sonar:local": "sonar-scanner -Dsonar.host.url=http://localhost:9000",
    "analyze": "npm run test:coverage && npm run sonar"
  }
}
```

## 🔍 Troubleshooting

### Coverage not showing

1. Check `coverage/lcov.info` exists
2. Verify path in `sonar-project.properties`
3. Ensure tests ran successfully

### Scanner not found

```bash
# Install globally
npm install -g sonarqube-scanner

# Or use npx
npx sonarqube-scanner
```

### Connection refused

1. Check SonarQube server is running
2. Verify host URL in command
3. Check firewall settings

## 📊 Coverage Goals

Current project structure:
```
src/
├── modules/
│   ├── analytics/     (Target: 80%+)
│   ├── auth/          (Target: 90%+)
│   ├── budgets/       (Target: 80%+)
│   ├── categories/    (Target: 85%+)
│   └── transactions/  (Target: 85%+)
└── shared/
    ├── composables/   (Target: 75%+)
    └── ui/            (Target: 60%+)
```

## 🎓 Best Practices

1. **Run coverage before commit**
   ```bash
   npm run test:coverage
   ```

2. **Review SonarQube before merge**
   - Check quality gate status
   - Fix critical issues
   - Review code smells

3. **Monitor trends**
   - Track coverage over time
   - Reduce technical debt
   - Improve code quality

## 🔗 Useful Links

- [SonarQube Docs](https://docs.sonarqube.org/)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [SonarCloud](https://sonarcloud.io/)
- [Quality Gates](https://docs.sonarqube.org/latest/user-guide/quality-gates/)
