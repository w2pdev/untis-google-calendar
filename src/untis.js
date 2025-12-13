import { WebUntisSecretAuth } from 'webuntis';
import dotenv from "dotenv";
import { authenticator as Authenticator } from 'otplib';
dotenv.config({ path: ".env" });

export class Untis {
  #untis;

  constructor() {
    this.#untis = new WebUntisSecretAuth(
      process.env.UNTIS_SCHOOLID ?? "",
      process.env.UNTIS_USER ?? "",
      process.env.UNTIS_SECRET ?? "",
      process.env.UNTIS_URL ??"",
      "Calendar",
      Authenticator
    );

  }
  
  async getWeekTimetable() {
    const start = new Date();

    console.log(start.toISOString());

    await this.#untis.login();
    const timetable = await this.#untis.getOwnTimetableForWeek(start);

    timetable.forEach((element) => {
      const date = element.date.toString();

      console.log(
        date.substring(0, 4) +
          " " +
          date.substring(4, 6) +
          " " +
          date.substring(6, 8)
      );
      console.log(element.startTime + " - " + element.endTime);
      console.log(element.subjects[0]?.element.longName);
      console.log("NEXT");
    });

    return timetable;
  }

  async getDayTimetable(date) {
    await this.#untis.login();
    return await this.#untis.getOwnTimetableFor(date);
  }

  #processTimes(time) {
    let hour = Math.floor(time / 100);
    let minute = time % 100;

    return { hour, minute };
  }

  #shortenSubject(name) {
    return name?.replace(
      /^(Leistungsfach|Basisfach)\s+(.+?)(?:\s+\d+)?$/, // Zahl am Ende optional
      (_, fach, subject) => {
        const suffix = fach === "Leistungsfach" ? "LK" : "BK";
        return `${subject} ${suffix}`;
      }
    );
  }

  #mergeSubjects(timetable) {
  if (!timetable || timetable.length === 0) return [];

  const merged = [];
  let prev = timetable[0];

  for (let i = 1; i < timetable.length; i++) {
    const curr = timetable[i];

    // If missing data → push as-is
    if (!curr || !prev) {
      merged.push(prev);
      prev = curr;
      continue;
    }

    const prevEnd = prev.endTime.hour * 60 + prev.endTime.minute;
    const currStart = curr.startTime.hour * 60 + curr.startTime.minute;

    const isSameSlot =
      curr.shortName === prev.shortName &&
      curr.room === prev.room &&
      curr.code === prev.code &&       
      (currStart === prevEnd || currStart === prevEnd + 5);

    if (isSameSlot) {
      prev.endTime = { ...curr.endTime };
    } else {
      merged.push(prev);
      prev = curr;
    }
  }

  merged.push(prev);
  return merged;
  }

  #processTimetableArray(timetable) {
  let formattedTimetable = [];

  timetable.forEach((e) => {
    let startTime = this.#processTimes(e.startTime);
    let endTime = this.#processTimes(e.endTime);

    let shortName = e.su?.[0]?.name;
    let name = this.#shortenSubject(e.su?.[0]?.longname);
    let room = e.ro?.[0]?.name;
    let code = e.code ?? null;
	let lsinfo = e.lstext ?? null;
	let tname = name;
	if (tname === undefined){
		let str = String(lsinfo);
		name = str;
	}

    formattedTimetable.push({
      startTime,
      endTime,
      shortName,
      name,
      room,
      code,
	  lsinfo,
	  
    });
  });
  return this.#mergeSubjects(formattedTimetable);
  }

  async getChanges() {}

  async getFormattedTimetable( date , count ) {
	const weekTimetable = [];
	const today = new Date(date);
	const dayOfWeek = today.getDay();
  console.log(`\x1b[4m\x1b[32mGetting untis data\x1b[0m`);

	// Calculate Monday
	const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
	const monday = new Date(today);
	monday.setDate(diff);

	for (let i = 0; i < count; i++) {
		const currentDay = new Date(monday);   // clone Monday
		currentDay.setDate(monday.getDate() + i);

		console.log(`\x1b[4m${currentDay.toDateString()}\x1b[0m`);
		const timetable = await this.getDayTimetable(currentDay);
		weekTimetable.push(this.#processTimetableArray(timetable));
	}

	return weekTimetable;
	}
	
}
