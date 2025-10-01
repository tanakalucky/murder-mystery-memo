import { MemoInput } from './components/MemoInput';
import { MemoList } from './components/MemoList';

export function Memo() {
  return (
    <div className='flex flex-col'>
      <MemoList />
      <MemoInput />
    </div>
  );
}
