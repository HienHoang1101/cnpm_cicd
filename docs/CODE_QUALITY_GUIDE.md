# 📊 Code Quality Guide

## Mục lục
- [Tổng quan](#tổng-quan)
- [ESLint Configuration](#eslint-configuration)
- [Prettier Configuration](#prettier-configuration)
- [SonarCloud Integration](#sonarcloud-integration)
- [CI/CD Integration](#cicd-integration)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)

---

## Tổng quan

Dự án FastFood Delivery Platform sử dụng các công cụ sau để đảm bảo chất lượng code:

| Tool | Mục đích | Config File |
|------|----------|-------------|
| **ESLint** | Linting & Static Analysis | `.eslintrc.json` |
| **Prettier** | Code Formatting | `.prettierrc` |
| **SonarCloud** | Code Quality & Security | `sonar-project.properties` |

---

## ESLint Configuration

### Cài đặt

```bash
npm install --save-dev eslint
```

### File cấu hình: `.eslintrc.json`

```json
{
  "env": {
    "node": true,
    "es2022": true,
    "jest": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  }
}
```

### Rules chính

| Rule | Severity | Mô tả |
|------|----------|-------|
| `no-unused-vars` | warn | Cảnh báo biến không sử dụng |
| `eqeqeq` | error | Bắt buộc dùng `===` thay vì `==` |
| `no-eval` | error | Cấm sử dụng `eval()` |
| `no-var` | warn | Khuyến khích dùng `let`/`const` |
| `prefer-const` | warn | Khuyến khích dùng `const` |
| `no-console` | off | Cho phép console (server-side) |
| `require-await` | warn | Cảnh báo async function không có await |

### Chạy ESLint

```bash
# Chạy trên toàn bộ project
npx eslint . --ext .js

# Chạy trên service cụ thể
npx eslint auth/ --ext .js

# Tự động fix
npx eslint . --ext .js --fix

# Với report format
npx eslint . --ext .js -f json -o eslint-report.json
```

### Tích hợp VS Code

Cài extension: **ESLint** (`dbaeumer.vscode-eslint`)

Settings:
```json
{
  "eslint.enable": true,
  "eslint.validate": ["javascript"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Prettier Configuration

### Cài đặt

```bash
npm install --save-dev prettier
```

### File cấu hình: `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "trailingComma": "none",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Giải thích settings

| Setting | Value | Mô tả |
|---------|-------|-------|
| `semi` | `true` | Thêm semicolon cuối dòng |
| `singleQuote` | `true` | Dùng single quote cho strings |
| `printWidth` | `100` | Độ dài tối đa 100 ký tự |
| `tabWidth` | `2` | Indent 2 spaces |
| `trailingComma` | `none` | Không có trailing comma |
| `bracketSpacing` | `true` | Space trong object `{ a: 1 }` |
| `arrowParens` | `avoid` | `x => x` thay vì `(x) => x` |

### Chạy Prettier

```bash
# Kiểm tra format
npx prettier --check .

# Format toàn bộ
npx prettier --write .

# Format file cụ thể
npx prettier --write "auth/**/*.js"

# Kiểm tra file cụ thể
npx prettier --check "order/**/*.js"
```

### Tích hợp VS Code

Cài extension: **Prettier** (`esbenp.prettier-vscode`)

Settings:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## SonarCloud Integration

### Đăng ký SonarCloud

1. Truy cập [sonarcloud.io](https://sonarcloud.io)
2. Đăng nhập với GitHub
3. Import repository `cnpm_cicd`
4. Copy **Project Key** và **Organization**

### Tạo SONAR_TOKEN

1. SonarCloud → My Account → Security
2. Generate Tokens → Tạo token mới
3. Copy token

### Thêm Secret vào GitHub

1. GitHub Repo → Settings → Secrets and variables → Actions
2. New repository secret:
   - Name: `SONAR_TOKEN`
   - Value: (paste token)

### File cấu hình: `sonar-project.properties`

```properties
sonar.projectKey=fastfood-delivery-platform
sonar.projectName=FastFood Delivery Platform
sonar.projectVersion=1.0.0

# Source directories
sonar.sources=auth,order,restaurant,payment-service,notification-service,admin-service

# Exclusions
sonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/**,**/*.test.js

# Coverage
sonar.javascript.lcov.reportPaths=auth/coverage/lcov.info,order/coverage/lcov.info

# Quality Gate
sonar.qualitygate.wait=true
```

### Quality Gates mặc định

| Metric | Threshold |
|--------|-----------|
| Coverage | > 80% |
| Duplicated Lines | < 3% |
| Maintainability Rating | A |
| Reliability Rating | A |
| Security Rating | A |
| Security Hotspots Reviewed | 100% |

---

## CI/CD Integration

### Pipeline Jobs

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Lint     │────▶│ Unit Tests  │────▶│ SonarCloud  │
│ ESLint +    │     │   Jest +    │     │  Analysis   │
│  Prettier   │     │  Coverage   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Lint Job

```yaml
lint:
  steps:
    - name: Install ESLint and Prettier
      run: npm install --save-dev eslint prettier

    - name: Run ESLint
      run: npx eslint . --ext .js -f json -o lint-reports/eslint-report.json

    - name: Check Prettier formatting
      run: npx prettier --check . || echo "Formatting issues found"
```

### SonarCloud Job

```yaml
sonarcloud:
  needs: [lint, unit-tests]
  steps:
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## Hướng dẫn sử dụng

### 1. Kiểm tra code locally

```bash
# Chạy tất cả checks
npm run lint
npm run format:check

# Hoặc chạy từng bước
npx eslint . --ext .js
npx prettier --check .
```

### 2. Fix issues tự động

```bash
# ESLint fix
npx eslint . --ext .js --fix

# Prettier fix
npx prettier --write .
```

### 3. Thêm scripts vào package.json

```json
{
  "scripts": {
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "quality": "npm run lint && npm run format:check"
  }
}
```

### 4. Pre-commit hook (husky)

```bash
# Cài đặt husky
npm install --save-dev husky lint-staged

# Cấu hình lint-staged
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
```

### 5. VS Code workspace settings

Tạo file `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.enable": true,
  "eslint.validate": ["javascript"],
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Troubleshooting

### ESLint không chạy

```bash
# Kiểm tra cài đặt
npx eslint --version

# Cài lại
npm install --save-dev eslint
```

### Prettier conflict với ESLint

Thêm config:
```json
{
  "extends": ["eslint:recommended", "prettier"]
}
```

### SonarCloud không nhận coverage

1. Kiểm tra path trong `sonar-project.properties`
2. Đảm bảo file `lcov.info` tồn tại
3. Check logs trong SonarCloud dashboard

### CI/CD fail

1. Xem logs chi tiết trong GitHub Actions
2. Kiểm tra secrets đã được configure
3. Verify SONAR_TOKEN còn valid

---

## Resources

- [ESLint Docs](https://eslint.org/docs/latest/)
- [Prettier Docs](https://prettier.io/docs/en/index.html)
- [SonarCloud Docs](https://docs.sonarcloud.io/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**Cập nhật lần cuối:** $(date +%Y-%m-%d)
