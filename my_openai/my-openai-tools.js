import { getEvents, insertEvent } from "./google_calendar.js";

/********************************************************************
 * Pomocna funkcija, vraca listu zakazanih termina zadatog dana
 * upitom u kalendar
 *
 * @param {*} yyyy_mm_dd string 'YYYY-MM-DD'
 */
async function getBookedSlots(yyyy_mm_dd) {
  //------------ pocetak funkcije -------------------s
  // start - end je interval od jednog dana
  const start = new Date(yyyy_mm_dd);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  // lista zakazanih dogadjaja u zadatom danu
  const eventList = await getEvents(start, end);

  // uproscena lista rezervisanih vremenskih slotova
  return eventList.map((value) => {
    return {
      begin: new Date(value.start.dateTime),
      end: new Date(value.end.dateTime),
      booked: true,
    };
  });
}

/********************************************************************
 * Proverava da li je termin bukiran
 *
 * @param {*} date_time string 'YYYY-MM-DDThh:mm:ssZ'
 * @returns
 */
async function isBooked(date_time) {
  const dt = new Date(date_time);
  const yyyy_mm_dd = dt.toISOString().substring(0, 10);
  const booked_slots = await getBookedSlots(yyyy_mm_dd);
  return booked_slots.some((value) => {
    return value.begin <= dt && dt < value.end;
  });
}

/**********************************************************
 * Opis funkcije koja vraca listu zakazanih ili slobodnih termina
 */
const get_slots_func = {
  name: "get_slots",
  description: "Prikazi zauzete ili slobodne termine",
  parameters: {
    type: "object",
    properties: {
      begin: {
        type: "string",
        description: "Interval start date in string format YYYY-MM-DD",
      },
      booked: {
        type: "integer",
        description:
          "Ako je booked=1 vraca zauzete termine, ako je booked=0 vraca slobodne",
      },
    },
    required: ["begin", "booked"],
  },
};

/**********************************************************
 * Funkcija vraca slobodne ili zauzete termine u zadatom danu
 * @param {*} {begin:'YYYY-MM-DD', booked:true/false}
 * @returns
 */
async function get_slots({ begin, booked }) {
  // pomocna funkcija, formira novi niz od vremenskih slotova iz niza A
  // koji se ne preklapaju sa slotovima u nizu B, odnosno vraca novi niz
  // od elemenata iz A sa vremenskim slotovima koji su disjunktni u odnosu
  // na one iz niza B
  const freeSlots = (nizA, nizB) => {
    // proverava da li su intervali disjunktni
    const disjunkt_test = (a, b) => {
      return (b.begin < a.begin && b.end <= a.begin) || a.end <= b.begin;
    };

    let rezultat = nizA.filter((elementA) => {
      return !nizB.some((elementB) => !disjunkt_test(elementB, elementA));
    });

    return rezultat;
  };

  // pomocna funkcija, generise zadati broj vremenskih intervala
  const allSlots = (startDate, startTime, numberOfSlots) => {
    const timeSlots = [];
    let currentSlotStart = new Date(startDate);
    currentSlotStart.setHours(startTime + 1);

    for (let i = 0; i < numberOfSlots; i++) {
      // Postavljanje početka vremenskog slota na sledeći ceo sat
      currentSlotStart.setMinutes(0);
      currentSlotStart.setSeconds(0);

      const currentSlotEnd = new Date(currentSlotStart);
      // Postavljanje kraja vremenskog slota na 59 minuta od početka
      currentSlotEnd.setMinutes(60);

      timeSlots.push({
        begin: new Date(currentSlotStart),
        end: new Date(currentSlotEnd),
        booked: false,
      });

      // Pomeramo se na sledeći sat
      currentSlotStart.setHours(currentSlotStart.getHours() + 1);
    }

    return timeSlots;
  };

  const booked_slots = await getBookedSlots(begin);

  let ret = booked_slots;
  if (!booked) {
    // pocetak radnog vremena u 9, 8 slotova od po sat
    const all_slots = allSlots(begin, 9, 8);
    ret = freeSlots(all_slots, booked_slots);
  }

  return JSON.stringify(ret);
}
// ************************ end get_slots ***************************

/********************************************************************
 * Opis funkcije koja rezervise termine
 */
const set_slot_func = {
  name: "set_slot",
  description: "Rezerviši, zakaži termin.",
  parameters: {
    type: "object",
    properties: {
      begin: {
        type: "string",
        description: "Početka termina u string formatu YYYY-MM-DDThh:mm:ssZ",
      },
    },
    required: ["begin"],
  },
};

/**********************************************************
 * Funkcija rezervise termin
 *
 * @param {*} param0 string 'YYYY-MM-DDThh:mm:ssZ'
 * @returns
 */
async function set_slot({ begin }) {
  const booked = await isBooked(begin);

  let ret = {
    message: "Termin nije dostupan.",
  };

  if (!booked) {
    const event_begin = new Date(begin);
    const event_end = new Date(begin);
    event_end.setHours(event_end.getHours() + 1);

    let event = {
      summary: `Zauzet termin`,
      description: `This is the description.`,
      start: {
        dateTime: event_begin, // moze i string 'YYYY-MM-DDThh:mm:ssZ'
        // timeZone: "Europe/Belgrade", // opciono
      },
      end: {
        dateTime: event_end,
        // timeZone: "Europe/Belgrade", // opciono
      },
    };

    const status = await insertEvent(event);

    if (status)
      ret = {
        message: "Termin je zakazan.",
      };
  }
  return JSON.stringify(ret);
}

// tools lista koja se exportuje
const tools_list = [
  // { type: "function", function: get_weather_func },
  { type: "function", function: get_slots_func },
  { type: "function", function: set_slot_func },
];

// callback objekat sa funkcijama opisanim u tools_list
const callback = { get_slots, set_slot };

export { tools_list, callback };
