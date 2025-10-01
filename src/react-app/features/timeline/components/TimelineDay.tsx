import { TimelineHourSlot } from './TimelineHourSlot';

interface TimelineDayProps {
  day: number;
}

export function TimelineDay({ day }: TimelineDayProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className='space-y-2'>
      {/* Day Header */}
      <div className='sticky top-0 bg-slate-900/90 backdrop-blur-sm py-2 mb-4 border-b border-amber-500/30'>
        <h3 className='text-amber-400 font-semibold text-lg'>Day {day}</h3>
      </div>

      {/* Hours for this day */}
      {hours.map((hour) => (
        <TimelineHourSlot key={`${day}-${hour}`} day={day} hour={hour} />
      ))}
    </div>
  );
}
