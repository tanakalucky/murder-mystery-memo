import { render, screen } from '@testing-library/react';
import { TimelineDay } from '../../TimelineDay';
import { TimelineHourSlot } from '../../TimelineHourSlot';

vi.mock('../../TimelineHourSlot');

describe('TimelineDay', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('正常にレンダリングされること', () => {
    // Arrage
    render(<TimelineDay day={1} />);

    // Assert
    expect(screen.getByText('Day 1')).toBeInTheDocument();
  });

  it('24時間分のタイムラインの枠が表示されること', () => {
    // Arrange
    render(<TimelineDay day={1} />);

    // Assert
    expect(TimelineHourSlot).toHaveBeenCalledTimes(24);
  });
});
