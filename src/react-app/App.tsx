import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Calendar,
  Trash2,
  RotateCcw,
  Grip,
  CreditCard as Edit3,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isEditing?: boolean;
}

interface TimelineEntry {
  id: string;
  content: string;
  day: number;
  hour: number;
  timestamp: Date;
  isEditing?: boolean;
}

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentDay, setCurrentDay] = useState(1);
  const [draggedItem, setDraggedItem] = useState<ChatMessage | null>(null);
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('murderMystery_messages');
    const savedTimeline = localStorage.getItem('murderMystery_timeline');
    const savedDay = localStorage.getItem('murderMystery_currentDay');

    if (savedMessages) {
      setMessages(
        JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      );
    }

    if (savedTimeline) {
      setTimeline(
        JSON.parse(savedTimeline).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        })),
      );
    }

    if (savedDay) {
      setCurrentDay(Number.parseInt(savedDay));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('murderMystery_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('murderMystery_timeline', JSON.stringify(timeline));
  }, [timeline]);

  useEffect(() => {
    localStorage.setItem('murderMystery_currentDay', currentDay.toString());
  }, [currentDay]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = () => {
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: inputValue.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addMessage();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setTimeline([]);
  };

  const clearTimeline = () => {
    const timelineMessages = timeline.map((entry) => ({
      id: entry.id,
      content: entry.content,
      timestamp: entry.timestamp,
    }));
    setMessages((prev) => [...prev, ...timelineMessages]);
    setTimeline([]);
  };

  const handleDragStart = (e: React.DragEvent, message: ChatMessage) => {
    setDraggedItem(message);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverHour(hour);
  };

  const handleDragLeave = () => {
    setDragOverHour(null);
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    if (draggedItem) {
      const timelineEntry: TimelineEntry = {
        ...draggedItem,
        day: currentDay,
        hour: hour,
      };
      setTimeline((prev) => [...prev, timelineEntry]);
      setMessages((prev) => prev.filter((msg) => msg.id !== draggedItem.id));
      setDraggedItem(null);
      setDragOverHour(null);
    }
  };

  const handleDropDay = (e: React.DragEvent, day: number, hour: number) => {
    e.preventDefault();
    if (draggedItem) {
      const timelineEntry: TimelineEntry = {
        ...draggedItem,
        day: day,
        hour: hour,
      };
      setTimeline((prev) => [...prev, timelineEntry]);
      setMessages((prev) => prev.filter((msg) => msg.id !== draggedItem.id));
      setDraggedItem(null);
      setDragOverHour(null);
    }
  };
  const editMessage = (id: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: newContent, isEditing: false } : msg,
      ),
    );
  };

  const editTimelineEntry = (id: string, newContent: string) => {
    setTimeline((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, content: newContent, isEditing: false }
          : entry,
      ),
    );
  };

  const startEditing = (id: string, type: 'message' | 'timeline') => {
    if (type === 'message') {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, isEditing: true } : msg)),
      );
    } else {
      setTimeline((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, isEditing: true } : entry,
        ),
      );
    }
  };

  const MessageCard = ({
    message,
    onEdit,
    onStartEdit,
  }: {
    message: ChatMessage;
    onEdit: (id: string, content: string) => void;
    onStartEdit: (id: string) => void;
  }) => {
    const [editValue, setEditValue] = useState(message.content);

    const handleSave = () => {
      onEdit(message.id, editValue);
    };

    const handleCancel = () => {
      setEditValue(message.content);
      onEdit(message.id, message.content);
    };

    return (
      <div
        className='group bg-slate-800/70 rounded-lg p-4 mb-3 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-200 cursor-move backdrop-blur-sm'
        draggable
        onDragStart={(e) => handleDragStart(e, message)}
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
                onClick={() => onStartEdit(message.id)}
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
  };

  const TimelineCard = ({
    entry,
    onEdit,
    onStartEdit,
  }: {
    entry: TimelineEntry;
    onEdit: (id: string, content: string) => void;
    onStartEdit: (id: string) => void;
  }) => {
    const [editValue, setEditValue] = useState(entry.content);

    const handleSave = () => {
      onEdit(entry.id, editValue);
    };

    const handleCancel = () => {
      setEditValue(entry.content);
      onEdit(entry.id, entry.content);
    };

    return (
      <div className='group bg-gradient-to-r from-amber-900/20 to-amber-800/20 rounded-lg p-3 border border-amber-700/30 hover:border-amber-500/50 transition-all duration-200 backdrop-blur-sm'>
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
                onClick={() => onStartEdit(entry.id)}
                className='cursor-text hover:bg-amber-900/20 rounded p-1 -m-1 transition-colors'
              >
                <p className='text-slate-200 leading-relaxed whitespace-pre-wrap text-sm'>
                  {entry.content}
                </p>
              </div>
            )}
          </div>
          <Edit3 className='w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity ml-3' />
        </div>
      </div>
    );
  };

  // Generate 24 hours for timeline
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: currentDay }, (_, i) => i + 1);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100'>
      <div className='container mx-auto px-4 py-6'>
        <div className='grid grid-cols-2 gap-6 h-[calc(100vh-48px)]'>
          {/* Left Panel - Chat */}
          <div className='flex flex-col'>
            {/* Chat Messages */}
            <div className='flex-1 bg-slate-900/50 rounded-lg border border-slate-700/50 backdrop-blur-sm'>
              <div className='h-80 overflow-y-auto p-4'>
                {messages.length === 0 ? (
                  <div className='flex items-center justify-center h-full text-slate-500'>
                    <p>調査ノートを追加してください</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageCard
                        key={message.id}
                        message={message}
                        onEdit={editMessage}
                        onStartEdit={(id) => startEditing(id, 'message')}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Chat Input */}
            <div className='mt-4 bg-slate-900/50 rounded-lg border border-slate-700/50 p-4 backdrop-blur-sm'>
              <div className='flex gap-4'>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='新しい調査ノートを入力...'
                  className='flex-1 bg-slate-800/50 border border-slate-600 rounded-lg p-4 text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all'
                  rows={3}
                />
                <div className='flex flex-col gap-2'>
                  <button
                    onClick={addMessage}
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
          </div>

          {/* Right Panel - Timeline */}
          <div className='flex flex-col'>
            {/* Timeline Header */}
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

            {/* Timeline Content */}
            <div className='flex-1 bg-slate-900/50 rounded-lg border border-slate-700/50 backdrop-blur-sm'>
              <div className='max-h-[calc(100vh-200px)] overflow-y-auto p-4'>
                <div className='space-y-8'>
                  {days.map((day) => (
                    <div key={day} className='space-y-2'>
                      {/* Day Header */}
                      <div className='sticky top-0 bg-slate-900/90 backdrop-blur-sm py-2 mb-4 border-b border-amber-500/30'>
                        <h3 className='text-amber-400 font-semibold text-lg'>
                          Day {day}
                        </h3>
                      </div>

                      {/* Hours for this day */}
                      {hours.map((hour) => {
                        const entriesForHour = timeline.filter(
                          (entry) => entry.hour === hour && entry.day === day,
                        );
                        const isDragOver = dragOverHour === hour;

                        return (
                          <div
                            key={`${day}-${hour}`}
                            className={`border-l-4 pl-4 py-2 transition-all duration-200 ${
                              isDragOver
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-slate-600 hover:border-amber-500/50'
                            }`}
                            onDragOver={(e) => handleDragOver(e, hour)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropDay(e, day, hour)}
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
                                  <TimelineCard
                                    key={entry.id}
                                    entry={entry}
                                    onEdit={editTimelineEntry}
                                    onStartEdit={(id) =>
                                      startEditing(id, 'timeline')
                                    }
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
