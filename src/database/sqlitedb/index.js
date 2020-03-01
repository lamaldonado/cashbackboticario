const sqlite3 = require('sqlite3').verbose();
const util = require('util');

class SqliteDb {
  async openDb() {
    try {
      this.db = new sqlite3.Database('data.db');
      this.db.get = util.promisify(this.db.get);
      this.db.run = util.promisify(this.db.run);
      this.db.all = util.promisify(this.db.all);
      return;
    } catch (err) {
      throw Error(err);
    }
  }

  /* async getDb(sql, params) {
    let count = 0;
    let result;
    do {
      try {
        result = await this.db.get(sql, params);
        return result;
      } catch (err) {
        if (err.message.indexOf('SQLITE_BUSY') > -1) { // The database is busy
          count += 1;
          await sleep(Math.floor(Math.random() * (500 - 150 + 1) + 150));
        } else if (err) {
          throw Error(err);
        }
      }
    } while (count <= MAXTRIES);
    return result;
  } */

  async runDb(sql, params) {
    try {
      await this.db.run(sql, params);
      return;
    } catch (err) {
      throw Error(err);
    }
  }

  closeDb() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  /* async getData(sql, params) {
    try {
      await this.openDb();
    } catch (err) {
      throw Error(err.message);
    }
    let returnedRow;
    try {
      returnedRow = await this.getDb(sql, params);
    } catch (err) {
      throw Error(err.message);
    }
    try {
      await this.closeDb();
    } catch (err) {
      throw Error(err.message);
    }
    return returnedRow;
  } */

  async runSql(sql, params) {
    try {
      await this.openDb();
    } catch (err) {
      throw Error(err.message);
    }
    try {
      await this.runDb(sql, params);
    } catch (err) {
      throw Error(err.message);
    }
    try {
      await this.closeDb();
    } catch (err) {
      throw Error(err.message);
    }
  }
}

module.exports.SqliteDb = SqliteDb;
