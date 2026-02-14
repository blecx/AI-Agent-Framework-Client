# VS Code Global/Workspace Settings (AI-Agent-Framework-Client)

This repository is often used alongside the backend repo (`blecx/AI-Agent-Framework`). To reduce repeated approval prompts in Copilot Chat (terminal + subagents), configure auto-approve rules.

## Where to put these settings

- **Workspace settings** (recommended for repo-specific rules): `.vscode/settings.json`
- **User settings** (global): VS Code → **Preferences: Open User Settings (JSON)**

When both exist, workspace settings win.

## Fresh chat requirement

Copilot Chat typically reads tool auto-approve settings when a chat session starts.

After changing settings:

1. Run **Developer: Reload Window**
2. Start a **new Copilot Chat** (fresh session)

## What we auto-approve here

This repo’s `.vscode/settings.json` auto-approves common, low-risk dev commands such as:

- Git + GitHub CLI (`git`, `gh`)
- Node workflows (`npm install`, `npm run lint`, `npm test`, `vitest`)
- Common shell utilities (`rg`, `fd`, `find`, `grep`, `awk`, `sed`, `jq`, etc.)
- Optional: `ssh-add` (convenience for SSH-based GitHub workflows)

## Security note

Auto-approving `ssh-add` is convenient but security-sensitive. Only enable/keep it if you trust the workspace content and installed extensions.

## Related

- Backend reference guide: `AI-Agent-Framework/docs/VSCODE-GLOBAL-SETTINGS.md`
