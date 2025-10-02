import { useApp } from '@/contexts/AppContext';
import { useDnd } from '@/features/dnd/DndContext';
import { CreditCard as Edit3, Grip } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { TimelineEntry } from '../types';

interface TimelineCardProps {
  entry: TimelineEntry;
}

export function TimelineCard({ entry }: TimelineCardProps) {
  const { editTimelineEntry, startEditingTimelineEntry } = useApp();
  const { startDrag } = useDnd();
  const [editValue, setEditValue] = useState(entry.content);

  const handleSave = () => {
    editTimelineEntry(entry.id, editValue);
  };

  const handleCancel = () => {
    setEditValue(entry.content);
    editTimelineEntry(entry.id, entry.content);
  };

  const handleDragStart = (e: React.DragEvent) => {
    startDrag(entry);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className='group bg-gradient-to-r from-amber-900/20 to-amber-800/20 rounded-lg p-3 border border-amber-700/30 hover:border-amber-500/50 transition-all duration-200 backdrop-blur-sm cursor-move'
      draggable
      onDragStart={handleDragStart}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          {entry.isEditing ? (
            <div className='space-y-2'>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className='w-full bg-slate-900/50 text-slate-200 border border-slate-600 rounded p-2 resize-none focus:outline-none focus:border-amber-500'
                rows={2}
                autoFocus
              />
              <div className='flex gap-2'>
                <button
                  onClick={handleSave}
                  className='px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm transition-colors'
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className='px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm transition-colors'
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => startEditingTimelineEntry(entry.id)}
              className='cursor-text hover:bg-amber-900/20 rounded p-1 -m-1 transition-colors'
            >
              <p className='text-slate-200 leading-relaxed whitespace-pre-wrap text-sm'>
                {entry.content}
              </p>
            </div>
          )}
        </div>
        <div className='flex items-center gap-2 ml-3'>
          <Edit3 className='w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity' />
          <Grip className='w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity' />
        </div>
      </div>
    </div>
  );
}
