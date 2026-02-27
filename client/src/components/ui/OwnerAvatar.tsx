import { useMemo, useState } from 'react';
import './OwnerAvatar.css';
import { getOwnerInitials } from './ownerAvatarUtils';

interface OwnerAvatarProps {
  owner?: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md';
  showOwnerText?: boolean;
  className?: string;
}

export default function OwnerAvatar({
  owner,
  avatarUrl,
  size = 'sm',
  showOwnerText = true,
  className,
}: OwnerAvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);

  const displayName = useMemo(() => {
    const trimmedOwner = owner?.trim();
    return trimmedOwner || 'Unassigned';
  }, [owner]);

  const initials = useMemo(() => getOwnerInitials(owner), [owner]);
  const shouldRenderImage = Boolean(avatarUrl) && !hasImageError;
  const ariaLabel = showOwnerText ? undefined : `Owner: ${displayName}`;

  return (
    <span className={`owner-avatar-group ${className || ''}`.trim()} aria-label={ariaLabel}>
      {shouldRenderImage ? (
        <img
          className={`owner-avatar owner-avatar-${size}`}
          src={avatarUrl || undefined}
          alt=""
          aria-hidden={showOwnerText ? 'true' : undefined}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span
          className={`owner-avatar owner-avatar-${size} owner-avatar-fallback`}
          aria-hidden={showOwnerText ? 'true' : undefined}
        >
          {initials}
        </span>
      )}

      {showOwnerText && <span className="owner-avatar-name">{displayName}</span>}
    </span>
  );
}