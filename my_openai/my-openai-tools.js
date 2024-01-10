import { isBooked, book, get_termins } from "../db/db.js";

/**********************************************************
 * Deskripcija funkcije cije pozivanje OpenAI moze da trazi
 * Opis obuhvata: ime funkcije, namena na osnovu cega model
 * donosi odluku o pozivanju i opis parametara za poziv
 * funkcije i listu obaveznih parametara kod poziva.
 *
 * Opis funkcije se registruje kod OpenAI preko requestBody
 * objekta koji se salje kao body u POST http metodu
 *
 */
const get_weather_func = {
  name: "get_weather",
  description: "Determine weather in my location",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city and state e.g. San Francisco, CA",
      },
      unit: {
        type: "string",
        enum: ["C", "F"],
      },
    },
    required: ["location"],
  },
};

/**********************************************************
 * Definicija funkcije za vreme
 */
function get_weather({ location, unit }) {
  let temperature = "unknown";
  unit = unit || "C";
  switch (location) {
    case "Beograd":
    case "Beograd, Srbija":
    case "Belgrade":
    case "Belgrade, Serbia":
      temperature = 4;
      break;
    case "Sonta":
    case "Сонта":
    case "Sonta, Srbija":
    case "Sonta, Serbia":
    case "Сонта, Србија":
      temperature = 21;
      break;
    case "Kraljevo":
    case "Краљево":
    case "Kraljevo, Srbija":
    case "Kraljevo, Serbia":
    case "Краљево, Србија":
      temperature = -30;
      break;
    // default:
    //   break;
  }
  const ret = JSON.stringify({ location, temperature, unit });
  console.log(`Exit get_weather... data:${ret}`);
  return ret;
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
 * Funkcija vraca slobodne ili zauzete termine
 * @param {*}
 * @returns
 */
async function get_slots({ begin, booked }) {
  //> 
  console.log("get_slots", begin, "booked", booked);

  const begin_ms = new Date(begin).getTime();
  let tmpTermini = await get_termins(begin_ms, booked);
  console.log(tmpTermini);
  return JSON.stringify(tmpTermini);
}

/**********************************************************
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
 * @param {*} param0
 * @returns
 */
async function set_slot({ begin }) {
  //> ispis
  console.log("set_slot_new", begin);

  const begin_ms = new Date(begin).getTime();
  const booked = await isBooked(begin_ms);

  let ret = {
    message: "Termin nije dostupan.",
  };

  if (!booked) {
    book(begin_ms);
    ret = {
      message: "Termin je zakazan.",
    };
  }
  return JSON.stringify(ret);
}

// tools lista koja se exportuje
const tools_list = [
  { type: "function", function: get_weather_func },
  { type: "function", function: get_slots_func },
  { type: "function", function: set_slot_func },
];

// callback objekat sa funkcijama opisanim u tools_list
const callback = { get_weather, get_slots, set_slot };

export { tools_list, callback };
