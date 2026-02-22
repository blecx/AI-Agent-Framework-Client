import { mkdtempSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';

import { describe, expect, it } from 'vitest';

import { runUxPacketCheck } from './check-ux-packet.mjs';

function tempDir() {
  return mkdtempSync(path.join(os.tmpdir(), 'ux-packet-test-'));
}

describe('runUxPacketCheck', () => {
  it('passes non-UI scope without packet', () => {
    const exitCode = runUxPacketCheck({
      changedFiles: 'docs/README.md,client/tests/README.md',
      dryRun: true,
    });
    expect(exitCode).toBe(0);
  });

  it('fails UI scope when packet missing', () => {
    const exitCode = runUxPacketCheck({
      changedFiles: 'client/src/components/Foo.tsx',
      packetPath: path.join(tempDir(), 'missing.md'),
      dryRun: true,
    });
    expect(exitCode).toBe(1);
  });

  it('passes UI scope when packet exists and PR evidence is present', () => {
    const directory = tempDir();
    const packetPath = path.join(directory, 'ux-packet.md');
    const prBodyPath = path.join(directory, 'pr-body.md');

    writeFileSync(packetPath, '# packet\n');
    writeFileSync(
      prBodyPath,
      [
        '# Summary',
        '## UX / Navigation Review',
        '- [x] UX packet consulted and attached for this UI scope.',
      ].join('\n')
    );

    const exitCode = runUxPacketCheck({
      changedFiles: 'client/src/components/Foo.tsx',
      packetPath,
      prBodyFile: prBodyPath,
      dryRun: true,
    });

    expect(exitCode).toBe(0);
  });

  it('passes UI scope with PR evidence only when packet artifact is absent', () => {
    const directory = tempDir();
    const prBodyPath = path.join(directory, 'pr-body.md');

    writeFileSync(
      prBodyPath,
      [
        '# Summary',
        '## UX / Navigation Review',
        '- [x] blecs-ux-authority consulted and UX packet available in PR evidence.',
      ].join('\n')
    );

    const exitCode = runUxPacketCheck({
      changedFiles: 'client/src/components/Foo.tsx',
      packetPath: path.join(directory, 'missing.md'),
      prBodyFile: prBodyPath,
      dryRun: true,
    });

    expect(exitCode).toBe(0);
  });
});
