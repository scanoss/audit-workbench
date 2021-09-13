/* eslint-disable no-async-promise-executor */

import fs from 'fs';

class UtilsDb {
  // READ RESULTS FROM A FILE
  async readFile(path: string) {
    return new Promise<any>((resolve, reject) => {
      fs.readFile(path, async (err: any, jsonString: any) => {
        if (err) reject(err);
        const result: any = JSON.parse(jsonString);
        resolve(result);
      });
    });
  }

  getTimeStamp() {
    const time = new Date();
    const timeStamp = time.toISOString();
    return timeStamp;
  }
}
export { UtilsDb };
