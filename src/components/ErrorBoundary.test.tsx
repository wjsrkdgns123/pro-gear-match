import { describe, it, expect, vi } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb({ message = 'boom' }: { message?: string }): ReactElement {
  throw new Error(message);
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>safe child</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('safe child')).toBeTruthy();
  });

  it('catches thrown errors and renders fallback', () => {
    // Silence React's console error during the expected throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bomb message="kaboom" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText(/kaboom/)).toBeTruthy();
    expect(screen.getByText('Reload')).toBeTruthy();
    spy.mockRestore();
  });
});
