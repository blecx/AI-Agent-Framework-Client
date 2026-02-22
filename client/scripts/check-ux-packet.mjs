#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';

function parseArgs(argv) {
  const args = {
    changedFiles: '',
    packetPath: '',
    prBodyFile: '',
    uiChanged: '',
    dryRun: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (token.startsWith('--') && index + 1 < argv.length) {
      const key = token.slice(2);
      args[key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function parseChangedFiles(input) {
  if (!input) {
    return [];
  }
  return input
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isUiFile(filePath) {
  return (
    filePath.startsWith('client/src/') ||
    filePath.startsWith('src/') ||
    /\.(tsx|jsx|css|scss|sass)$/i.test(filePath)
  );
}

function isUiAffected(changedFiles, uiChangedFlag) {
  if (typeof uiChangedFlag === 'string' && uiChangedFlag.length > 0) {
    return uiChangedFlag.toLowerCase() === 'true';
  }
  return changedFiles.some(isUiFile);
}

function validatePrBodyEvidence(prBodyFile) {
  if (!prBodyFile) {
    return { ok: false, message: 'No PR body file provided for UX packet evidence validation.' };
  }

  if (!existsSync(prBodyFile)) {
    return { ok: false, message: `PR body file not found: ${prBodyFile}` };
  }

  const body = readFileSync(prBodyFile, 'utf-8');
  const heading = '## UX / Navigation Review';
  if (!body.includes(heading)) {
    return { ok: false, message: 'Missing PR section: ## UX / Navigation Review' };
  }

  const sectionStart = body.indexOf(heading);
  const nextHeadingIndex = body.slice(sectionStart + heading.length).search(/\n##\s+/);
  const section =
    nextHeadingIndex === -1
      ? body.slice(sectionStart)
      : body.slice(sectionStart, sectionStart + heading.length + nextHeadingIndex);

  const packetEvidenceChecked = /^- \[[xX]\].*(ux packet|blecs-ux-authority).*(consulted|available|attached)/im.test(section);
  if (!packetEvidenceChecked) {
    return {
      ok: false,
      message:
        'UX / Navigation Review must include a checked line confirming UX packet/blecs-ux-authority consultation evidence.',
    };
  }

  return { ok: true, message: 'PR body includes UX packet evidence.' };
}

export function runUxPacketCheck(options) {
  const changedFiles = parseChangedFiles(options.changedFiles || process.env.CHANGED_FILES || '');
  const uiAffected = isUiAffected(changedFiles, options.uiChanged || process.env.UI_CHANGED || '');
  const packetPath = options.packetPath || process.env.UX_PACKET_PATH || '.tmp/ux-consult-issue.md';

  if (options.dryRun) {
    console.log('🧪 Dry-run UX packet check');
    console.log(`   changedFiles=${changedFiles.length}`);
    console.log(`   uiAffected=${uiAffected}`);
    console.log(`   packetPath=${packetPath}`);
  }

  if (!uiAffected) {
    console.log('✅ Non-UI scope detected; UX packet is not required.');
    return 0;
  }

  const evidenceCheck = validatePrBodyEvidence(options.prBodyFile || process.env.PR_BODY_FILE || '');
  const packetExists = existsSync(packetPath);

  if (!packetExists && !evidenceCheck.ok) {
    console.error(`❌ UI-affecting scope requires UX packet, but file is missing: ${packetPath}`);
    console.error(`❌ ${evidenceCheck.message}`);
    return 1;
  }

  if (!packetExists && evidenceCheck.ok) {
    console.log('✅ UX packet evidence found in PR body (no local packet artifact present).');
    return 0;
  }

  if (!evidenceCheck.ok) {
    console.error(`❌ ${evidenceCheck.message}`);
    return 1;
  }

  console.log(`✅ UI-affecting scope: UX packet found at ${packetPath}`);
  return 0;
}

if (process.argv[1] && process.argv[1].endsWith('check-ux-packet.mjs')) {
  const args = parseArgs(process.argv);
  process.exit(runUxPacketCheck(args));
}
