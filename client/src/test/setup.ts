import '@testing-library/jest-dom';
import { beforeAll, vi } from 'vitest';

const SUPPRESSED_MESSAGES = [
	'React Router Future Flag Warning',
	'not wrapped in act(...)',
	'react-i18next:: useTranslation: You will need to pass in an i18next instance',
	'i18next is maintained with support from locize.com',
];

function shouldSuppress(args: unknown[]): boolean {
	const text = args
		.map((value) => (typeof value === 'string' ? value : String(value)))
		.join(' ');

	return SUPPRESSED_MESSAGES.some((message) => text.includes(message));
}

const originalWarn = console.warn;
const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {
	vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
		if (shouldSuppress(args)) {
			return;
		}
		originalWarn(...args);
	});

	vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
		if (shouldSuppress(args)) {
			return;
		}
		originalError(...args);
	});

	vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
		if (shouldSuppress(args)) {
			return;
		}
		originalLog(...args);
	});
});
