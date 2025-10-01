import { useApp } from '@/contexts/AppContext';
import { Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

export function MemoInput() {
  const { addMessage, clearHistory } = useApp();
  const [inputValue, setInputValue] = useState('');

  const handleAddMessage = () => {
    addMessage(inputValue);
    setInputValue('');
  };

  const hanldeKayDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddMessage();
    }
  };

  return (
    <div className='mt-4 bg-slate-900/50 rounded-lg border border-slate-700/50 p-4 backdrop-blur-sm'>
      <div className='flex gap-4'>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={hanldeKayDown}
          placeholder='新しい調査ノートを入力...'
          className='flex-1 bg-slate-800/50 border border-slate-600 rounded-lg p-4 text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all'
          rows={3}
        />
        <div className='flex flex-col gap-2'>
          <button
            onClick={handleAddMessage}
            className='px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg'
          >
            追加
          </button>
          <button
            onClick={clearHistory}
            className='flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg text-sm transition-all duration-200 hover:shadow-lg'
          >
            <Trash2 className='w-4 h-4' />
            履歴クリア
          </button>
        </div>
      </div>
    </div>
  );
}
