export function getWeeksMonday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today);

  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  return monday;
}

export function getMonday(date) {
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(date);

  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  return { monday, diff };
}

export function getWeeksSunday() {
  const monday = getWeeksMonday();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59);

  return sunday;
}

export function getSunday(date) {
  const { monday, diff } = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59);

  return { sunday, diff };
}