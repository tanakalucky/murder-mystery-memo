import { AppProvider, useApp } from '@/contexts/AppContext';
import { DndProvider } from '@/features/dnd/DndContext';
import { userEvent } from '@vitest/browser/context';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import type { TimelineEntry } from '../../../types';
import { TimelineCard } from '../../TimelineCard';

const Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <AppProvider>
      <DndProvider>{children}</DndProvider>
    </AppProvider>
  );
};

const TimelineCardContainer = () => {
  const { timeline } = useApp();
  const entry = timeline[0];

  if (!entry) return null;

  return <TimelineCard entry={entry} />;
};

describe('TimelineCard (Browser Mode)', () => {
  const mockEntry: TimelineEntry = {
    id: 'test-1',
    content: 'Test timeline entry',
    isEditing: false,
    day: 1,
    hour: 10,
    timestamp: new Date('2025-01-01T10:00:00'),
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('murderMystery_timeline', JSON.stringify([mockEntry]));
  });

  it('通常モードでエントリーの内容を表示する', async () => {
    // Act
    const screen = render(<TimelineCardContainer />, { wrapper: Wrapper });

    // Assert
    await expect
      .element(screen.getByText('Test timeline entry'))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('textbox')).not.toBeInTheDocument();
  });

  it('カードをクリックして編集モードに切り替わる', async () => {
    // Arrange
    const screen = render(<TimelineCardContainer />, { wrapper: Wrapper });

    const content = screen.getByText('Test timeline entry');
    await expect.element(screen.getByRole('textbox')).not.toBeInTheDocument();

    // Act
    await userEvent.click(content);

    // Assert
    await expect.element(screen.getByRole('textbox')).toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: '保存' }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole('button', { name: 'キャンセル' }))
      .toBeInTheDocument();
  });

  it('編集して保存すると内容が更新される', async () => {
    // Arrange
    const screen = render(<TimelineCardContainer />, { wrapper: Wrapper });

    const content = screen.getByText('Test timeline entry');
    await userEvent.click(content);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Test timeline entry');

    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'Updated entry');

    // Act
    await userEvent.click(screen.getByRole('button', { name: '保存' }));

    // Assert
    await expect.element(screen.getByText('Updated entry')).toBeInTheDocument();
    await expect.element(screen.getByRole('textbox')).not.toBeInTheDocument();
  });

  it('編集をキャンセルすると元の内容に戻る', async () => {
    // Arrange
    const screen = render(<TimelineCardContainer />, { wrapper: Wrapper });

    const content = screen.getByText('Test timeline entry');
    await userEvent.click(content);

    const textarea = screen.getByRole('textbox');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, 'This will be cancelled');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'キャンセル' }));

    // Assert
    await expect
      .element(screen.getByText('Test timeline entry'))
      .toBeInTheDocument();
    await expect.element(screen.getByRole('textbox')).not.toBeInTheDocument();
  });
});
