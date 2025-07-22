export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getHourIntervals() {
  const intervals: { label: string; isHour: boolean }[] = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const label = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      intervals.push({
        label,
        isHour: minute === 0,
      });
    }
  }

  return intervals;
}
