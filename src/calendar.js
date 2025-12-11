import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import dotenv from "dotenv";
import { getMonday, getSunday, getMonda } from "./utils.js";
dotenv.config({ path: "../.env" });

const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export class GoogleCalendar {
  #client;
  #calendar;
  #calendarId = process.env.GOOGLE_CALENDAR_ID ?? "";

  constructor() {
    this.#client = new google.auth.GoogleAuth({
      keyFile: "./service-account.json",
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    this.#calendar = google.calendar({
      version: "v3",
      auth: this.#client,
    });
  }

  async deleteWeek(date) {
    if (!date) date = new Date();

    const monday = getMonda(date);
    const sunday = getSunday(date);

    const events = await this.#calendar.events.list({
      calendarId: this.#calendarId,
      timeMin: monday.toISOString(),
      timeMax: sunday.toISOString(),
      singleEvents: true,
    });

    for (const item of events.data.items) {
      if (!item.id) continue;

      await this.#calendar.events.delete({
        eventId: item.id,
        calendarId: this.#calendarId,
      });
      console.log(`deleted event ${item.summary}`);
      await new Promise((res) => setTimeout(res, 500));
    }
  }

  async addEvent(name, description, startDate, endDate, code) {
  // Map Untis codes to Google Calendar colorIds
  const codeColorMap = {
    cancelled: "11",   // Red
    exam: "9",         // Blue
    substitution: "3", // Purple
    default: "5",     // Orange
	irregular: "3",   //Purple
	null: "5", //Orange
  };

  const colorId = code ? (codeColorMap[code.toLowerCase()] || codeColorMap.default) : codeColorMap.default;

  // Include code in the description
  const fullDescription = code
    ? `${description}\n\nStatus: ${code.toUpperCase()}`
    : description;

  await this.#calendar.events.insert({
    calendarId: this.#calendarId,
    resource: {
      summary: name,
      description: fullDescription,
      start: { dateTime: startDate, timeZone: "Europe/Berlin" },
      end: { dateTime: endDate, timeZone: "Europe/Berlin" },
      colorId,
    },
  });
}
} 
