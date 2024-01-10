import sqlite3 from "sqlite3";

// const zt_db = new sqlite3.Database("./db/zakazivanje_termina.db");

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
  return new Promise(function (resolve, reject) {
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

export { getRowsDB, runSQL, insRowSQL, insRowDB };
