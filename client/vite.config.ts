import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { writeFileSync } from 'node:fs'

function getCommitSha(): string {
  return (
    process.env.GITHUB_SHA ??
    process.env.CI_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    'unknown'
  )
}

function getSourceRepo(): string {
  return process.env.GITHUB_REPOSITORY ?? 'blecx/AI-Agent-Framework-Client'
}

function uiBuildProvenancePlugin() {
  return {
    name: 'ui-build-provenance',
    apply: 'build' as const,
    writeBundle(options: { dir?: string }) {
      const outDir = options.dir ?? 'dist'
      const outputFile = path.join(outDir, 'ui-build.json')
      const payload = {
        sourceRepo: getSourceRepo(),
        commitSha: getCommitSha(),
        buildTimestamp: new Date().toISOString(),
      }

      writeFileSync(outputFile, JSON.stringify(payload, null, 2))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), uiBuildProvenancePlugin()],
  preview: {
    port: 3000,
  },
})
