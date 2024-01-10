import sqlite3 from "sqlite3";
import { getRowsDB, runSQL, insRowSQL, insRowDB } from "./my_sqlite3.js";

const log_db = new sqlite3.Database("./route/viber/viber.db");

/********************************************************************
 * Brisanje poruka iz baze starijih od hour sati
 *
 * @param {*} hour sati
 */
async function delMessages(hour) {
  const dhms = new Date().getTime() - hour * 60 * 60 * 1000;
  const sql = `delete from log where time_stamp < ${dhms.toString()}`;
  await runSQL(log_db, sql);
}

/********************************************************************
 * Dodavanje objekta u bazu.
 * Objekat je formata {user_id,time_stamp,msg_json},
 * msg_json je JSON zapis OpenAI objekat poruke {role,content}
 *
 * @param {*} row objekat koji se smesta u bazu
 */
async function insMessage(row) {
  await insRowDB(log_db, "log", row);
}

/********************************************************************
 * Generisanje liste poruka-dialoga, za zadatog korisnika
 *
 * @param {*} userID id korisnika
 * @returns niz poruka u OpenAI formatu
 */
async function getMessages(userID) {
  const sql = `select * from log where user_id = '${userID}'`;
  const ret = await getRowsDB(log_db, sql);
  return ret.map((value) => JSON.parse(value.msg_json));
}

export { delMessages, insMessage, getMessages };

// const msg = {
//   role: "user",
//   content: "Zdravo. Ovo je poruka",
// };

// const row = {
//   user_id: "8NBjHv6P48uZwG9e8Jb3yg==",
//   time_stamp: new Date().getTime().toString(),
//   msg_json: JSON.stringify(msg),
// };

// await insMessage(row);
// await delMessages(0.1);
// const lista = await getMessages("8NBjHv6P48uZwG9e8Jb3yg==");
// console.log(lista);
