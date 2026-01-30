import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Skeleton, {
  SkeletonProjectCard,
  SkeletonList,
} from '../../../components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.skeleton');
    expect(skeleton).toBeTruthy();
    expect(skeleton?.getAttribute('aria-busy')).toBe('true');
  });

  it('renders with custom dimensions', () => {
    const { container } = render(<Skeleton width="200px" height="40px" />);
    const skeleton = container.querySelector('.skeleton') as HTMLElement;
    expect(skeleton.style.width).toBe('200px');
    expect(skeleton.style.height).toBe('40px');
  });

  it('renders different variants', () => {
    const { container: textContainer } = render(<Skeleton variant="text" />);
    expect(textContainer.querySelector('.skeleton-text')).toBeTruthy();

    const { container: circularContainer } = render(
      <Skeleton variant="circular" />,
    );
    expect(circularContainer.querySelector('.skeleton-circular')).toBeTruthy();

    const { container: rectContainer } = render(
      <Skeleton variant="rectangular" />,
    );
    expect(rectContainer.querySelector('.skeleton-rectangular')).toBeTruthy();
  });
});

describe('SkeletonProjectCard', () => {
  it('renders skeleton project card', () => {
    const { container } = render(<SkeletonProjectCard />);
    const card = container.querySelector('.skeleton-project-card');
    expect(card).toBeTruthy();
    expect(card?.getAttribute('aria-busy')).toBe('true');
  });
});

describe('SkeletonList', () => {
  it('renders default 3 skeleton items', () => {
    const { container } = render(<SkeletonList />);
    const items = container.querySelectorAll('.skeleton-list-item');
    expect(items.length).toBe(3);
  });

  it('renders custom count of skeleton items', () => {
    const { container } = render(<SkeletonList count={5} />);
    const items = container.querySelectorAll('.skeleton-list-item');
    expect(items.length).toBe(5);
  });
});
