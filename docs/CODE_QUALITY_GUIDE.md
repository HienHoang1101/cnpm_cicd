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

## SonarQube Integration (Self-Hosted)

Dự án sử dụng **SonarQube Community Edition** (miễn phí) chạy local thay vì SonarCloud.

### Khởi động SonarQube Server

```bash
# Khởi động SonarQube bằng Docker
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community

# Kiểm tra container đang chạy
docker ps --filter "name=sonarqube"
```

### Truy cập Dashboard

- **URL:** http://localhost:9000
- **Username:** `admin`
- **Password:** `admin` (đổi sau lần đầu đăng nhập)

### Tạo Project & Token

1. Đăng nhập SonarQube
2. **Create Project** → **Create a local project**
3. Project Key: `fastfood-delivery`
4. Display Name: `FastFood Delivery Platform`
5. Click **Locally** → **Generate Token**
6. Copy token

### Chạy SonarQube Scanner

```bash
# Cài đặt Scanner
npm install -g sonar-scanner

# Chạy scan với token
sonar-scanner \
  -Dsonar.projectKey=fastfood-delivery \
  -Dsonar.sources=auth,order,restaurant,payment-service,notification-service,admin-service,food-delivery-server \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=YOUR_TOKEN \
  -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/**,**/build/**,**/tests/**
```

### File cấu hình: `sonar-project.properties`

```properties
# Project identification
sonar.projectKey=fastfood-delivery
sonar.projectName=FastFood Delivery Platform
sonar.projectVersion=1.0.0

# SonarQube Server (Local)
sonar.host.url=http://localhost:9000

# Source directories
sonar.sources=auth,order,restaurant,payment-service,notification-service,admin-service,food-delivery-server

# Exclusions
sonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/**,**/build/**,**/tests/**

# Coverage
sonar.javascript.lcov.reportPaths=auth/coverage/lcov.info,order/coverage/lcov.info,restaurant/coverage/lcov.info,admin-service/coverage/lcov.info

# Quality Gate
sonar.qualitygate.wait=true
```

### Thêm Secrets vào GitHub (cho CI/CD)

1. GitHub Repo → Settings → Secrets and variables → Actions
2. Thêm secrets:
   - `SONAR_TOKEN`: Token từ SonarQube
   - `SONAR_HOST_URL`: `http://your-sonarqube-server:9000`

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
│    Lint     │────▶│ Unit Tests  │────▶│  SonarQube  │
│ ESLint +    │     │   Jest +    │     │  Analysis   │
│  Prettier   │     │  Coverage   │     │(self-hosted)│
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

### SonarQube Job (Self-Hosted Runner)

```yaml
sonarqube:
  runs-on: self-hosted  # Requires self-hosted runner
  needs: [lint, unit-tests]
  if: contains(github.event.head_commit.message, '[sonar]')
  steps:
    - name: SonarQube Scan
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
      run: |
        sonar-scanner \
          -Dsonar.projectKey=fastfood-delivery \
          -Dsonar.host.url=$SONAR_HOST_URL \
          -Dsonar.login=$SONAR_TOKEN
```

### Trigger SonarQube trong CI/CD

Thêm `[sonar]` vào commit message để trigger scan:

```bash
git commit -m "feat: add new feature [sonar]"
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

### SonarQube không nhận coverage

1. Kiểm tra path trong `sonar-project.properties`
2. Đảm bảo file `lcov.info` tồn tại
3. Check logs trong SonarQube dashboard

### SonarQube container không khởi động

```bash
# Kiểm tra logs
docker logs sonarqube

# Restart container
docker restart sonarqube

# Xóa và tạo lại
docker rm -f sonarqube
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
```

### CI/CD fail

1. Xem logs chi tiết trong GitHub Actions
2. Kiểm tra secrets đã được configure
3. Verify SONAR_TOKEN còn valid

---

## Resources

- [ESLint Docs](https://eslint.org/docs/latest/)
- [Prettier Docs](https://prettier.io/docs/en/index.html)
- [SonarQube Docs](https://docs.sonarsource.com/sonarqube/latest/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Self-Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)

---

**Cập nhật lần cuối:** 2024-12-04
