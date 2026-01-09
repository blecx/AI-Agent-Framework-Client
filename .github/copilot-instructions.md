# Copilot Coding Agent Instructions

## Repository Overview
**AI-Agent-Framework-Client** - React/TypeScript web app built with Vite for testing AI-Agent-Framework API without workflows.
- **Stack**: React 19.2.0, TypeScript 5.9.3, Vite 7.2.4, Node.js 18+ (tested: 20.19.6, npm 10.8.2)
- **Size**: Small (~177 packages, 33 modules)
- **Deployment**: Docker with Nginx

## Build Commands (ALL from `client/` directory)

### Critical: Working Directory
**ALWAYS** run npm commands from `client/` directory: `cd client`

### Installation (REQUIRED before build/run)
```bash
cd client
npm install          # ~4s, or npm ci for CI/CD (~2s)
```

### Linting (REQUIRED before commit)
```bash
cd client
npm run lint         # <2s, must pass with 0 errors, ESLint v9 flat config
```

### Building (TypeScript then Vite)
```bash
cd client
npm run build        # ~1.4s, runs: tsc -b && vite build
                     # Output: client/dist/
```

### Development
```bash
cd client
npm run dev          # http://localhost:5173
npm run preview      # Preview production build
```

### No Tests
**npm test does not exist** - no test framework configured.

### Cleaning
```bash
cd client
rm -rf dist node_modules/.vite && npm run build     # Clear cache
rm -rf node_modules package-lock.json && npm install # Full clean
```

## Docker (from repo root)
```bash
docker compose up -d              # Build & run, http://localhost:3000
docker compose logs -f            # View logs
docker compose down               # Stop
docker build -t ai-agent-client . # Build image only
```
**Note**: Use `docker compose` (v2), NOT `docker-compose`. Multi-stage: Node 20 Alpine → Nginx Alpine.


## Project Structure
```
AI-Agent-Framework-Client/
├── client/                        # MAIN WORKING DIRECTORY
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApiTester.tsx     # Main UI (~250 lines)
│   │   │   └── ApiTester.css
│   │   ├── services/
│   │   │   └── api.ts            # API client (~260 lines)
│   │   ├── App.tsx               # Main component
│   │   ├── main.tsx              # Entry point
│   │   └── assets/, *.css
│   ├── public/vite.svg
│   ├── dist/                     # Build output (gitignored)
│   ├── package.json              # Scripts: dev, build, lint, preview
│   ├── eslint.config.js          # ESLint v9 flat config
│   ├── vite.config.ts            # Vite + @vitejs/plugin-react
│   ├── tsconfig.*.json           # TS project references (3 files)
│   ├── index.html
│   └── .env.example              # VITE_API_BASE_URL
├── Dockerfile                    # Multi-stage: Node→Nginx
├── docker-compose.yml            # Port 3000:80
├── nginx.conf                    # Prod server config
├── README.md, DEPLOYMENT.md
└── .gitignore
```

## Key Config Details
- **TypeScript**: 3 configs (tsconfig.json references app/node configs), ES2022 target, strict mode, no emit
- **Dependencies**: react 19, vite 7, eslint 9, typescript 5.9 (no test libs)
- **Environment**: `VITE_API_BASE_URL` (default: `http://localhost:8000/api`) - set at **build time**
- **Entry Points**: index.html → main.tsx → App.tsx → ApiTester.tsx
- **API Endpoints**: /health, /info, /agents, /agents/{id}/capabilities, /execute (POST)

## Common Issues
| Problem | Solution |
|---------|----------|
| Build fails with module errors | `cd client && rm -rf node_modules package-lock.json && npm install && npm run build` |
| Port 5173/3000 in use | Dev auto-selects next port; Docker: edit docker-compose.yml ports |
| ESLint v9 errors | Verify eslint.config.js flat config syntax |
| Docker build fails | Ensure package-lock.json committed |

## Validation Checklist
**Before commit**:
1. `cd client && npm run lint` (must pass)
2. `cd client && npm run build` (must succeed)
3. Verify `client/dist/` has index.html + assets/

**Before PR**: Same as above + test Docker if Dockerfile/package.json changed

## CI/CD Status
**No GitHub Actions workflows configured.** All validation is manual.


## Best Practices
1. **ALWAYS** `cd client` before npm commands
2. **ALWAYS** `npm install` after pulling package.json changes
3. **ALWAYS** lint before commit: `npm run lint`
4. **ALWAYS** test build before commit: `npm run build`
5. **NEVER commit**: node_modules/, dist/, .env (in .gitignore)
6. **Use npm ci** for CI/CD or troubleshooting
7. **Env vars** set at build time (rebuild required for changes)
8. **TypeScript strict mode**: fix type errors, avoid `any`/@ts-ignore
9. **Docker v2**: `docker compose` (space, not hyphen)

## Making Changes
- **UI**: `src/components/ApiTester.tsx` + `.css`
- **API**: `src/services/api.ts` (endpoints, test methods)
- **Styles**: Component .css or global index.css
- **Config**: vite.config.ts, eslint.config.js, tsconfig.*.json

**After changes**: `npm run dev` → test → `npm run lint` → `npm run build` → commit source only

## Validated Commands
These instructions validated by running:
- `npm install` (✓ ~4s)
- `npm run lint` (✓ <2s, 0 errors)
- `npm run build` (✓ ~1.4s)
- Clean builds, cache clearing, Docker/Compose commands

**Search only if**: instructions incomplete, error not documented, or tools updated since validation.
