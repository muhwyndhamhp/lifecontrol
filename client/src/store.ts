import { create, type StateCreator } from 'zustand/index';

type RefetchCalendarState = {
  range: {
    start: Date;
    end: Date;
  };
  setRange: (range?: { start: Date; end: Date }) => void;
  nextDay: () => void;
  previousDay: () => void;
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
      set({ range });
    },
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
  };
};

export const useAppStore = create<RefetchCalendarState>()((...a) => ({
  ...refetchCalendar(...a),
}));
