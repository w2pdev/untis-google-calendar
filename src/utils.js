export function getWeeksMonday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today);

  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  return monday;
}

export function getMonday({ date }) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;

  d.setDate(d.getDate() + diff);

  return { monday: d, diff };
}

export function getMonda(date) {
  const d = new Date(date);                    // clone
  const day = d.getDay();                      // 0=Sun,1=Mon,...

  // Calculate how many days to subtract to reach Monday
  const diff = (day === 0 ? -6 : 1) - day;

  d.setDate(d.getDate() + diff);
  
  return d;                                    // Monday
}

export function getWeeksSunday() {
  const monday = getWeeksMonday();
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59);

  return sunday;
}

export function getSunday(date) {
  const monday = getMonda(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59);

  return sunday;
}