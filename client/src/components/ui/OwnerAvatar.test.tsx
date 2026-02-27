import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import OwnerAvatar from './OwnerAvatar';
import { getOwnerInitials } from './ownerAvatarUtils';

describe('OwnerAvatar', () => {
  it('derives initials from email local part', () => {
    expect(getOwnerInitials('john.doe@example.com')).toBe('JD');
  });

  it('derives initials from multi-word name', () => {
    expect(getOwnerInitials('Jane Smith')).toBe('JS');
  });

  it('renders decorative avatar and owner text by default', () => {
    render(<OwnerAvatar owner="john@example.com" avatarUrl="https://github.com/john.png" />);

    const img = document.querySelector('img.owner-avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', '');
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('falls back to initials when image fails to load', () => {
    render(<OwnerAvatar owner="john@example.com" avatarUrl="https://example.com/broken.png" />);

    const img = document.querySelector('img.owner-avatar');
    expect(img).toBeInTheDocument();
    fireEvent.error(img as Element);

    expect(document.querySelector('.owner-avatar-fallback')).toHaveTextContent('JO');
  });

  it('uses Unassigned fallback when owner is missing', () => {
    render(<OwnerAvatar owner="" avatarUrl={null} />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
    expect(document.querySelector('.owner-avatar-fallback')).toHaveTextContent('?');
  });
});
