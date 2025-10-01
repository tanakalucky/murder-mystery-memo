import { useApp } from '@/contexts/AppContext';
import { TimelineDay } from './components/TimelineDay';
import { TimelineHeader } from './components/TimelineHeader';

export function Timeline() {
  const { currentDay } = useApp();
  const days = Array.from({ length: currentDay }, (_, i) => i + 1);

  return (
    <div className='flex flex-col'>
      <TimelineHeader />

      {/* Timeline Content */}
      <div className='flex-1 bg-slate-900/50 rounded-lg border border-slate-700/50 backdrop-blur-sm'>
        <div className='max-h-[calc(100vh-200px)] overflow-y-auto p-4'>
          <div className='space-y-8'>
            {days.map((day) => (
              <TimelineDay key={day} day={day} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
