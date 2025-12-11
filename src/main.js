import { eachWeekOfInterval } from "date-fns";
import { Untis } from "./untis.js";
import { GoogleCalendar } from "./calendar.js";
import { getMonday } from "./utils.js";
import { getMonda } from "./utils.js";

const untis = new Untis();
const calendar = new GoogleCalendar();


const todayDate = new Date();
todayDate.setDate(todayDate.getDate() + 0);
const nextDate = new Date();
nextDate.setDate(nextDate.getDate() + 7);
await addWeeks(todayDate, nextDate);

async function addLesson(lesson, baseDate) {
  const startTime = new Date(baseDate);
  const endTime = new Date(baseDate);

  startTime.setHours(lesson.startTime.hour);
  startTime.setMinutes(lesson.startTime.minute);
  endTime.setHours(lesson.endTime.hour);
  endTime.setMinutes(lesson.endTime.minute);

  try {
    await calendar.addEvent(
      lesson.name,
      `${lesson.room ?? "No Room"} - ${lesson.shortName ?? lesson.name}`,
      startTime.toISOString(),
      endTime.toISOString(),
      lesson.code 
    );

    console.log(`Added Event for \x1b[4m\x1b[32m${lesson.name}\x1b[0m`);
    await new Promise((res) => setTimeout(res, 500)); // avoid rate limits
  } catch (e) {
    console.error(e.message);
  }
}

async function updateCalendar(date, count) {

  const timetable = await untis.getFormattedTimetable(date, count);
  calendar.deleteWeek(date);
  const monday = getMonda(date);
  const currentDay = new Date(monday);

  for (let i = 0; i < timetable.length; i++) {
    // Create a new date for each day to avoid mutation
    
    currentDay.setDate(monday.getDate() + i);
    console.log(`\x1b[4m Adding Events for ${currentDay.toDateString()}\x1b[0m`);

    const dayTimetable = timetable[i];

    for (const e of dayTimetable) {
      if (!e.room) continue;
      await addLesson(e, currentDay);
    }
  }
}


async function addWeeks(startDate, endDate) {
	console.log(
      `\x1b[34mAdding timetable HI for week \x1b[1m${startDate.toISOString()}\x1b[0m`
    );
 
  await updateCalendar(startDate, 5); //Woche 1
  
  console.log(
      `\x1b[34mAdding timetable HI for week \x1b[1m${endDate.toISOString()}\x1b[0m`
    );

  await updateCalendar(endDate, 5);  //Woche 2
    
  }


