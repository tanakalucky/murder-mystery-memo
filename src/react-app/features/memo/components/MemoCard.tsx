import { useApp } from '@/contexts/AppContext';
import { useDnd } from '@/features/dnd/DndContext';
import { CreditCard as Edit3, Grip } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { ChatMessage } from '../types';

interface MemoCardProps {
  message: ChatMessage;
}

export function MemoCard({ message }: MemoCardProps) {
  const { editMessage, startEditingMessage } = useApp();
  const { startDrag } = useDnd();
  const [editValue, setEditValue] = useState(message.content);

  const handleSave = () => {
    editMessage(message.id, editValue);
  };

  const handleCancel = () => {
    setEditValue(message.content);
    editMessage(message.id, message.content);
  };

  const handleDragStart = (e: React.DragEvent) => {
    startDrag(message);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className='group bg-slate-800/70 rounded-lg p-4 mb-3 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-200 cursor-move backdrop-blur-sm'
      draggable
      onDragStart={handleDragStart}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          {message.isEditing ? (
            <div className='space-y-2'>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className='w-full bg-slate-900/50 text-slate-200 border border-slate-600 rounded p-2 resize-none focus:outline-none focus:border-amber-500'
                rows={3}
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
              onClick={() => startEditingMessage(message.id)}
              className='cursor-text hover:bg-slate-700/30 rounded p-1 -m-1 transition-colors'
            >
              <p className='text-slate-200 leading-relaxed whitespace-pre-wrap'>
                {message.content}
              </p>
              <p className='text-slate-500 text-xs mt-2'>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
        <div className='flex items-center gap-2 ml-3'>
          <Edit3 className='w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity' />
          <Grip className='w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity' />
        </div>
      </div>
    </div>
  );
}
