import { create, type StateCreator } from 'zustand/index';

type RefetchCalendarState = {
  range: {
    start: Date;
    end: Date;
    itemId?: string;
  };
  refetch: boolean;
  setRange: (range?: { start: Date; end: Date; itemId?: string }) => void;
  nextDay: () => void;
  previousDay: () => void;
  toggleRefetch: () => void;
};

export const refetchCalendar: StateCreator<RefetchCalendarState> = (
  set,
  get
) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    range: { start, end },
    setRange: (range) => {
      set({ range, refetch: true });
    },
    refetch: false,
    nextDay: () => {
      const range = get().range;

      const newStart = new Date(range.start);
      newStart.setDate(range.start.getDate() + 1);
      const newEnd = new Date(range.end);
      newEnd.setDate(range.end.getDate() + 1);

      set({ range: { start: newStart, end: newEnd } });
    },
    previousDay: () => {
      const range = get().range;

      const newStart = new Date(range.start);
      newStart.setDate(range.start.getDate() - 1);
      const newEnd = new Date(range.end);
      newEnd.setDate(range.end.getDate() - 1);

      set({ range: { start: newStart, end: newEnd } });
    },

    toggleRefetch: () => {
      set({ refetch: !get().refetch });
    },
  };
};

type GlobalKeyboardState = {
  keys: string[];
  setKeys: (keys: string[]) => void;
};

export const globalKeyboard: StateCreator<GlobalKeyboardState> = (set) => ({
  keys: [],
  setKeys: (keys: string[]) => {
    set({ keys });
  },
});

export const useAppStore = create<RefetchCalendarState & GlobalKeyboardState>()(
  (...a) => ({
    ...refetchCalendar(...a),
    ...globalKeyboard(...a),
  })
);
