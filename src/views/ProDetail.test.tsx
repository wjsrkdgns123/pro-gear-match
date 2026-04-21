import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProDetail } from './ProDetail';

// Mock the Firestore client so the component reads from an in-memory list
// instead of hitting the network. The shape mirrors getDocs' return.
vi.mock('../firebase', () => ({ db: {} }));

const PROS = [
  {
    name: 'TenZ',
    team: 'Sentinels',
    game: 'Valorant',
    profileUrl: 'https://example.com/tenz',
    gear: { mouse: 'Logitech G Pro X Superlight', keyboard: 'Wooting 60HE', monitor: 'Zowie XL2566K', mousepad: 'Artisan Hien' },
    settings: { dpi: 800, sensitivity: 0.4, edpi: 320 },
  },
];

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(async () => ({
    forEach: (cb: (d: { id: string; data: () => unknown }) => void) => {
      PROS.forEach((p, i) => cb({ id: String(i), data: () => p }));
    },
  })),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/pro/:slug" element={<ProDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProDetail', () => {
  beforeEach(() => {
    // localStorage.getItem('theme') and 'language' are read on mount
    localStorage.clear();
  });

  it('renders the pro once loaded', async () => {
    renderAt('/pro/tenz');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'TenZ' })).toBeTruthy();
    });
    expect(screen.getByText(/Valorant/)).toBeTruthy();
    expect(screen.getByText(/Sentinels/)).toBeTruthy();
    // eDPI stat
    expect(screen.getByText('320')).toBeTruthy();
    // gear appears
    expect(screen.getByText(/Logitech G Pro X Superlight/)).toBeTruthy();
  });

  it('shows "not found" for an unknown slug', async () => {
    renderAt('/pro/unknown-player-9999');
    await waitFor(() => {
      expect(
        screen.queryByText(/not found|찾을 수 없습니다/i),
      ).toBeTruthy();
    });
  });

  it('sets the document title to the pro name', async () => {
    renderAt('/pro/tenz');
    await waitFor(() => {
      expect(document.title).toMatch(/TenZ/);
    });
  });
});
