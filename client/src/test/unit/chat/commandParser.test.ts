/**
 * Unit tests for command parser
 */

import { describe, it, expect } from 'vitest';
import { parseCommand } from '../../../chat/commandParser';
import { CommandType } from '../../../chat/types';
import { RAIDType } from '../../../types/raid';

describe('commandParser', () => {
  describe('CREATE RAID patterns', () => {
    it('should parse "create a risk" command', () => {
      const result = parseCommand('create a risk');
      expect(result.type).toBe(CommandType.CREATE_RAID);
      expect(result.params.raidType).toBe(RAIDType.RISK);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should parse "add new assumption" command', () => {
      const result = parseCommand('add new assumption');
      expect(result.type).toBe(CommandType.CREATE_RAID);
      expect(result.params.raidType).toBe(RAIDType.ASSUMPTION);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should parse "log an issue" command', () => {
      const result = parseCommand('log an issue');
      expect(result.type).toBe(CommandType.CREATE_RAID);
      expect(result.params.raidType).toBe(RAIDType.ISSUE);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should parse "create dependency" command', () => {
      const result = parseCommand('create dependency');
      expect(result.type).toBe(CommandType.CREATE_RAID);
      expect(result.params.raidType).toBe(RAIDType.DEPENDENCY);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should parse "new raid" without specific type', () => {
      const result = parseCommand('new raid');
      expect(result.type).toBe(CommandType.CREATE_RAID);
      expect(result.params.raidType).toBeUndefined();
      expect(result.confidence).toBeLessThan(0.8);
    });

    it('should be case-insensitive', () => {
      const result = parseCommand('CREATE A RISK');
      expect(result.type).toBe(CommandType.CREATE_RAID);
      expect(result.params.raidType).toBe(RAIDType.RISK);
    });
  });

  describe('EDIT RAID patterns', () => {
    it('should parse "edit risk" command', () => {
      const result = parseCommand('edit risk');
      expect(result.type).toBe(CommandType.EDIT_RAID);
    });

    it('should parse "update assumption RAID-001" command', () => {
      const result = parseCommand('update assumption RAID-001');
      expect(result.type).toBe(CommandType.EDIT_RAID);
      expect(result.params.raidId).toBe('RAID-001');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should parse "modify issue R-42" command', () => {
      const result = parseCommand('modify issue R-42');
      expect(result.type).toBe(CommandType.EDIT_RAID);
      expect(result.params.raidId).toBe('R-42');
    });

    it('should parse "change dependency" without ID', () => {
      const result = parseCommand('change dependency');
      expect(result.type).toBe(CommandType.EDIT_RAID);
      expect(result.params.raidId).toBeUndefined();
      expect(result.confidence).toBeLessThan(0.8);
    });
  });

  describe('LIST RAID patterns', () => {
    it('should parse "list all risks" command', () => {
      const result = parseCommand('list all risks');
      expect(result.type).toBe(CommandType.LIST_RAID);
      expect(result.confidence).toBe(0.9);
    });

    it('should parse "show raid" command', () => {
      const result = parseCommand('show raid');
      expect(result.type).toBe(CommandType.LIST_RAID);
    });

    it('should parse "view issues" command', () => {
      const result = parseCommand('view issues');
      expect(result.type).toBe(CommandType.LIST_RAID);
    });

    it('should parse "get dependencies" command', () => {
      const result = parseCommand('get dependencies');
      expect(result.type).toBe(CommandType.LIST_RAID);
    });
  });

  describe('TRANSITION WORKFLOW patterns', () => {
    it('should parse "transition to planning" command', () => {
      const result = parseCommand('transition to planning');
      expect(result.type).toBe(CommandType.TRANSITION_WORKFLOW);
      expect(result.params.targetState).toBe('planning');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should parse "move to execution" command', () => {
      const result = parseCommand('move to execution');
      expect(result.type).toBe(CommandType.TRANSITION_WORKFLOW);
      expect(result.params.targetState).toBe('execution');
    });

    it('should parse "change state to closure" command', () => {
      const result = parseCommand('change state to closure');
      expect(result.type).toBe(CommandType.TRANSITION_WORKFLOW);
      expect(result.params.targetState).toBe('closure');
    });

    it('should parse "set state to monitoring" command', () => {
      const result = parseCommand('set state to monitoring');
      expect(result.type).toBe(CommandType.TRANSITION_WORKFLOW);
      expect(result.params.targetState).toBe('monitoring');
    });
  });

  describe('UNKNOWN patterns', () => {
    it('should return UNKNOWN for unrecognized commands', () => {
      const result = parseCommand('hello world');
      expect(result.type).toBe(CommandType.UNKNOWN);
      expect(result.confidence).toBe(0);
    });

    it('should return UNKNOWN for empty string', () => {
      const result = parseCommand('');
      expect(result.type).toBe(CommandType.UNKNOWN);
    });

    it('should preserve original message', () => {
      const message = 'some random text';
      const result = parseCommand(message);
      expect(result.originalMessage).toBe(message);
    });
  });

  describe('RAID ID extraction', () => {
    it('should extract RAID-001 format', () => {
      const result = parseCommand('edit risk RAID-001');
      expect(result.params.raidId).toBe('RAID-001');
    });

    it('should extract R-42 format', () => {
      const result = parseCommand('update R-42');
      expect(result.params.raidId).toBe('R-42');
    });

    it('should extract A-10 format (assumption)', () => {
      const result = parseCommand('change assumption A-10');
      expect(result.params.raidId).toBe('A-10');
    });

    it('should extract I-99 format (issue)', () => {
      const result = parseCommand('modify issue I-99');
      expect(result.params.raidId).toBe('I-99');
    });

    it('should extract D-5 format (dependency)', () => {
      const result = parseCommand('update dependency D-5');
      expect(result.params.raidId).toBe('D-5');
    });

    it('should handle lowercase IDs', () => {
      const result = parseCommand('edit raid-123');
      expect(result.params.raidId).toBe('RAID-123');
    });
  });
});
