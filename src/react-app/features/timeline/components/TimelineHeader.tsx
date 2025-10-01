import { useApp } from '@/contexts/AppContext';
import { RotateCcw } from 'lucide-react';

export function TimelineHeader() {
  const { currentDay, setCurrentDay, timeline, clearTimeline } = useApp();

  return (
    <div className='mb-4 bg-slate-900/50 rounded-lg border border-slate-700/50 p-4 backdrop-blur-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <label className='text-slate-300 text-sm'>Day:</label>
            <input
              type='number'
              value={currentDay}
              onChange={(e) =>
                setCurrentDay(Number.parseInt(e.target.value) || 1)
              }
              min='1'
              className='w-16 bg-slate-800/50 border border-slate-600 rounded px-3 py-1 text-slate-200 focus:outline-none focus:border-amber-500'
            />
          </div>
          <button
            onClick={clearTimeline}
            disabled={timeline.length === 0}
            className='flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700/50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-all duration-200'
          >
            <RotateCcw className='w-4 h-4' />
            タイムテーブルクリア
          </button>
        </div>
      </div>
    </div>
  );
}
