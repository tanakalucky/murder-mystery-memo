import { AppProvider } from '@/contexts/AppContext';
import { DndProvider } from '@/features/dnd/DndContext';
import { Memo } from '@/features/memo';
import { Timeline } from '@/features/timeline';

function App() {
  return (
    <AppProvider>
      <DndProvider>
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100'>
          <div className='container mx-auto px-4 py-6'>
            <div className='grid grid-cols-2 gap-6 h-[calc(100vh-48px)]'>
              <Memo />
              <Timeline />
            </div>
          </div>
        </div>
      </DndProvider>
    </AppProvider>
  );
}

export default App;
