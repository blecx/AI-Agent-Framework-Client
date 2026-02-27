export function getOwnerInitials(owner: string | null | undefined): string {
  const trimmedOwner = owner?.trim();
  if (!trimmedOwner) {
    return '?';
  }

  const base = trimmedOwner.includes('@')
    ? trimmedOwner.split('@')[0]
    : trimmedOwner;

  const parts = base
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return trimmedOwner.charAt(0).toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}