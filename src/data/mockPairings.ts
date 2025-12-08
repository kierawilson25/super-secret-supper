import { PairResult } from '@/hooks/usePairings';

export const mockPairings: PairResult[] = [
  {
    person1: { userid: '1', username: 'Alice' },
    person2: { userid: '3', username: 'Charlie' },
    dinnerID: '1',
  },
  {
    person1: { userid: '2', username: 'Bob' },
    person2: { userid: '4', username: 'Diana' },
    dinnerID: '1',
  },
];
