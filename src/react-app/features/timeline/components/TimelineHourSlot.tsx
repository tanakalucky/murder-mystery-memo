import { useApp } from '@/contexts/AppContext';
import { useDnd } from '@/features/dnd/DndContext';
import type React from 'react';
import { TimelineCard } from './TimelineCard';

interface TimelineHourSlotProps {
  day: number;
  hour: number;
}

export function TimelineHourSlot({ day, hour }: TimelineHourSlotProps) {
  const { timeline } = useApp();
  const { dragOverSlot, setDragOverSlot, handleDrop } = useDnd();

  const entriesForHour = timeline.filter(
    (entry) => entry.hour === hour && entry.day === day,
  );

  const isDragOver = dragOverSlot?.day === day && dragOverSlot?.hour === hour;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ day, hour });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    handleDrop(day, hour);
  };

  return (
    <div
      className={`border-l-4 pl-4 py-2 transition-all duration-200 ${
        isDragOver
          ? 'border-amber-500 bg-amber-500/10'
          : 'border-slate-600 hover:border-amber-500/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropEvent}
    >
      <div className='flex items-center gap-3 mb-2'>
        <span className='text-amber-400 font-mono text-sm font-medium min-w-[60px]'>
          {hour.toString().padStart(2, '0')}:00
        </span>
        <div className='flex-1 h-px bg-slate-700'></div>
      </div>

      {entriesForHour.length === 0 ? (
        <div className='text-slate-600 text-xs italic ml-16'>
          {isDragOver ? 'ここにドロップ' : ''}
        </div>
      ) : (
        <div className='ml-16 space-y-2'>
          {entriesForHour.map((entry) => (
            <TimelineCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
