// preuzeto sa: https://www.youtube.com/watch?v=dFaV95gS_0M

// const { google } = require("googleapis");
// require("dotenv").config();

import { google } from "googleapis";
//import dotenv from "dotenv";
//dotenv.config();

// Podaci za autentifikaciju i autorizaciju, google nudi vise nacina
// ovde se koristi Service Accounts, akreditivi se automatski preuzimaju sa
// servera u JSON formatu, od kog se formira .env fajl kao u projektu i iz
// kog se podaci ucitavaju u environment, ovo je jedan od nacina...
// u sustini iz celog fajla se koriste samo dva popdatka: client_email i private_key.
// Pored ovih podataka koristi se i calendarId, koji se ocitava iz google kalendara.
// U ggogle calendaru je potrebno omoguciti pristup servisu unosenjem client_email i
// dodeliti privilegije.
//
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Google calendar API settings
const SCOPES = "https://www.googleapis.com/auth/calendar";
const calendar = google.calendar({ version: "v3" });

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES
);

// Insert new event to Google Calendar
const insertEvent = async (event) => {
  try {
    let response = await calendar.events.insert({
      auth: auth,
      calendarId: calendarId,
      resource: event,
    });

    if (response["status"] == 200 && response["statusText"] === "OK") {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(`Error at insertEvent --> ${error}`);
    return 0;
  }
};

// Event for Google Calendar
// let event = {
//   summary: `This is the summary.`,
//   description: `This is the description.`,
//   start: {
//     dateTime: dateTime["start"], // moze i string 'YYYY-MM-DDThh:mm:ssZ'
//     timeZone: "Europe/Belgrade", // opciono
//   },
//   end: {
//     dateTime: dateTime["end"],
//     timeZone: "Europe/Belgrade", // opciono
//   },
// };

// const demo_event = {
//   summary: `Demo event.`,
//   description: `Demo funkcija upisivanja eventa u kalendar.`,
//   start: { dateTime: new Date("2024-01-12T12:00:00Z") },
//   end: { dateTime: "2024-01-12T13:00:00Z" },
// };

// console.log(demo_event);

// insertEvent(demo_event)
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// Get all the events between two dates
const getEvents = async (dateTimeStart, dateTimeEnd) => {
  try {
    let response = await calendar.events.list({
      auth: auth,
      calendarId: calendarId,
      timeMin: dateTimeStart,
      timeMax: dateTimeEnd,
      // timeZone: 'Europe/Belgrade'
    });

    // let items = response["data"]["items"];
    let items = response.data.items;
    return items;
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return 0;
  }
};

// let start = '2024-01-10T13:40:00.000Z';
// let end = '2024-01-12T13:40:00.000Z';

// getEvents(start, end)
//     .then((res) => {
//         console.log(res);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

// Delete an event from eventID
const deleteEvent = async (eventId) => {
  try {
    let response = await calendar.events.delete({
      auth: auth,
      calendarId: calendarId,
      eventId: eventId,
    });

    if (response.data === "") {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(`Error at deleteEvent --> ${error}`);
    return 0;
  }
};

// let eventId = 'hkkdmeseuhhpagc862rfg6nvq4';

// deleteEvent(eventId)
//     .then((res) => {
//         console.log(res);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

export { getEvents, insertEvent };
