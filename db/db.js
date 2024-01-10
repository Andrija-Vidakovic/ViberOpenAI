import sqlite3 from "sqlite3";
// import { ms, utc, danas_ms, b_ms } from "./mytime.js";

const db = new sqlite3.Database("./db/zakazivanje_termina.db");

//Funkcije niskog nivoa za manipulaciju sa bazom
//
/**********************************************************
 *  Upit u bazu, vraca JS niz objekata
 *
 * @param {*} db sqlite3 database object
 * @param {*} query SQLite query string
 * @returns rows from a database
 */
async function getRowsDB(db, query) {
  return new Promise((resolve, reject) => {
    db.all(query, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

/**********************************************************
 * Run SQL
 *
 * @param {*} db sqlite3 database object
 * @param {*} sql SQLite query string
 * @param {*} params array of sql params
 * @returns
 */
async function runSQL(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

/**********************************************************
 * Funkcija generise sql string za upis u bazu
 *
 * @param {*} table naziv tabele
 * @param {*} colums niz naziva kolona
 * @returns sql string za upis u db
 */
function insRowSQL(table, colums) {
  let col = colums.join(",");
  let val = colums.map((col) => "?").join(",");
  const sql = `INSERT INTO ${table}(${col}) VALUES (${val})`;
  return sql;
}

/**********************************************************
 * Funkcija upisuje JS objekat u db, Osobine objekta MORAJU
 * da se gađaju sa kolonama tabele u koju se upisuje podatak.
 *
 * @param {*} db sqlite3 db object
 * @param {*} row objekat koji se upisuje u db
 * @returns Promise
 */
async function insRowDB(db, table, row) {
  const sql = insRowSQL(table, Object.keys(row));
  const ret = await runSQL(db, sql, Object.values(row));
  return ret;
}

//=========================================================
// NOVE FUNKCIJE
/**********************************************************
 * Popunjavanje baze podataka
 *
 * @param {*} days
 */
async function fillDB(days) {
  const termini = [
    "T09:00Z",
    "T10:00Z",
    "T11:30Z",
    "T12:30Z",
    "T13:30Z",
    "T14:30Z",
  ];

  let now = new Date().getTime(); //ms
  //> prvo obrisi sve termine u buducnosti
  const sql = `\
  delete from termini where id \
  in ( select id from termini where pocetak >= ${now});`;
  await runSQL(db, sql);

  //> popuni termine od sutra
  for (let day = 1; day < days + 1; day++) {
    let T = new Date(now + day * 24 * 60 * 60 * 1000);
    if (T.getDay() === 0) continue;

    for (let termin of termini) {
      const strBegin = T.toISOString().replace(/T.+Z/, termin); // string
      const begin = new Date(strBegin).getTime(); // ms
      const end = begin + 60 * 60 * 1000;
      // console.log(new Date(begin), new Date(end));
      const row = {
        pocetak: begin,
        zavrsetak: end,
        prezime_ime: "",
        kontakt: "",
        interv: "",
        booked: 0,
      };
      // upisivanje u db
      const ret = await insRowDB(db, "termini", row);
    }
  }
}

/**********************************************************
 * Proverava da li je termin bukiran
 * @param {*} begin pocetak termina u formatu YYYY-MM-DDThh:mm:ssZ
 */
async function isBooked(begin_ms) {
  // const b_ms = new Date(begin).getTime(); // ms
  const sql = `select id from termini where booked = 0 and pocetak = ${begin_ms};`;
  const rows = await getRowsDB(db, sql);
  // console.log(begin_ms,rows);
  return !rows.length;
}

/**********************************************************
 * Bukira termin
 * @param {*} begin pocetak termina u ms
 */
async function book(begin_ms) {
  // const b_ms = new Date(begin).getTime(); // ms
  const sql = `update termini set booked=1 where id in\ 
  (select id from termini where pocetak=${begin_ms});`;
  await runSQL(db, sql);
}

/**********************************************************
 * Funkcija vraca slobodne ili zauzete termine
 * @param {*} begin pocetak termina u string formatu YYYY-MM-DD
 * @param {*} booked  zauzeti ili slobodni termini
 * @param {*} count broj termina koji se pokazuje
 */
async function get_termins(begin, booked, count = 6) {
  const begin_ms = new Date(begin).getTime();
  const sql = `select pocetak from termini where pocetak >= ${begin_ms} and booked = ${booked} limit ${count};`;
  const ret = await getRowsDB(db, sql);

  return ret.map((value) => {
    return { begin: new Date(value.pocetak).toISOString(),booked};
  });
}

export { isBooked, book, get_termins };



await fillDB(100);