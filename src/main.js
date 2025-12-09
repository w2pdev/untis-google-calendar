import { eachWeekOfInterval } from "date-fns";
import { Untis } from "./untis.js";
import { GoogleCalendar } from "./calendar.js";
import { getMonday } from "./utils.js";

const untis = new Untis();
const calendar = new GoogleCalendar();


async function addLesson(lesson, baseDate) {
  const startTime = new Date(baseDate);
  const endTime = new Date(baseDate);

  startTime.setHours(lesson.startTime.hour);
  startTime.setMinutes(lesson.startTime.minute);
  endTime.setHours(lesson.endTime.hour);
  endTime.setMinutes(lesson.endTime.minute);

  console.log(startTime.toISOString());

  try {
    await calendar.addEvent(
      lesson.name,
      `${lesson.room ?? "No Room"} - ${lesson.shortName ?? lesson.name}`,
      startTime.toISOString(),
      endTime.toISOString(),
      lesson.code // <-- Pass code here
    );

    console.log(`Added Event for \x1b[4m\x1b[32m${lesson.name}\x1b[0m`);
    await new Promise((res) => setTimeout(res, 500)); // avoid rate limits
  } catch (e) {
    console.error(e.message);
  }
}

async function updateCalendar(date) {
  const timetable = await untis.getFormattedTimetable();
  console.log(timetable);
  calendar.deleteWeek(date);
  const { monday, diff } = getMonday(date);

  for (let i = 0; i < timetable.length; i++) {
    // Create a new date for each day to avoid mutation
    const currentDay = new Date(monday);
    currentDay.setDate(monday.getDate() + i);
    console.log(`\x1b[4m Adding Events for ${currentDay.toDateString()}\x1b[0m`);

    const dayTimetable = timetable[i];

    for (const e of dayTimetable) {
      if (!e.room) continue;
      await addLesson(e, currentDay);
    }
  }
}
//await updateCalendar(new Date(2025, 12, 9));

async function addWeeks(startDate, endDate) {

  const weeks = eachWeekOfInterval({ start: startDate, end: endDate });
  

  for (const week of weeks) {
    console.log(
      `\x1b[34mAdding timetable HI for week \x1b[1m${week.toISOString()}\x1b[0m`
    );
    await updateCalendar(new Date(week));
  }
}

const todaayDate = new Date();
const nextDate = todaayDate;
nextDate.setDate(nextDate.getDate() + 7);
await addWeeks(todaayDate, nextDate);
