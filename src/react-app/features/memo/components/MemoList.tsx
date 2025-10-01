import { useApp } from '@/contexts/AppContext';
import { useEffect, useRef } from 'react';
import { MemoCard } from './MemoCard';

export function MemoList() {
  const { messages } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='flex-1 bg-slate-900/50 rounded-lg border border-slate-700/50 backdrop-blur-sm'>
      <div className='h-80 overflow-y-auto p-4'>
        {messages.length === 0 ? (
          <div className='flex items-center justify-center h-full text-slate-500'>
            <p>調査ノートを追加してください</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MemoCard key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
