/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable prettier/prettier */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import {  performance } from 'perf_hooks';
import { Querys } from './querys_db';
import { Db } from './db';
import { UtilsDb } from './utils_db';
import { Component , Files } from '../../api/types';
import { ComponentDb } from './scan_component_db';




const query = new Querys();
const utilsDb = new UtilsDb();

export class FilesDb extends Db {
  component: ComponentDb;

  constructor(path: string) {
    super(path);
    this.component = new ComponentDb(path);
  }

  get(file: Partial<Files>) {
    return new Promise(async (resolve, reject) => {
      try{
        let result:any;
      if (file.path)
         result = await this.getByPath(file);
      else
        resolve([]);

      if(result!==undefined)
      resolve(result);

    }catch(error){
      reject(new Error('Unable to retrieve file'));
    }
    });
  }


  // GET ALL FILES FOR A COMPONENT
  async getFilesComponent(data: Partial<Component>) {
    const t0 = performance.now();
    return new Promise(async (resolve, reject) => {
      let result;
      try{
        if(data.purl && data.version)
          result = await this.getByPurlVersion(data);
        else
          result = await this.getByPurl(data);
          const t1 = performance.now();
          console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
          resolve(result);
      }catch(error){
        console.log(error);
      }
    });
  }

  private async getByPurl(data :Partial<Component>){
    return new Promise(async (resolve, reject) => {
    const self = this;
    try{
      const db = await this.openDb();
      db.all(query.SQL_SELECT_FILES_FROM_PURL,data.purl,async function (err: any, file: any) {
      db.close();
        if (!err) {
          const components:any = await self.component.getAll({
            purl: data.purl,
            version: data.version,
          });              
          for (let i = 0; i < file.length; i += 1) {               
            file[i].component = components.find((component)=>file[i].version===component.version);
          }     
          resolve(file);
        }else
          resolve([]);
      });
    }
    catch(error){
      console.log(error);
    }
  });
  }

 private async getByPurlVersion(data :Partial<Component>){
  return new Promise(async (resolve, reject) => {
    const self = this;
    try{
      const db = await this.openDb();
      db.all(query.SQL_SELECT_FILES_FROM_PURL_VERSION,data.purl,data.version,async function (err: any, file: any) {
      db.close();
        if (!err) {
          const comp = await self.component.getAll({
            purl: data.purl,
            version: data.version,
          });
          for (let i = 0; i < file.length; i += 1) {
            file[i].component = comp;
          }
         resolve(file);
        }else
          resolve([]);
      });
    }
    catch(error){
      console.log(error);
    }
  });
}

  ignored(files: number[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          for (let i = 0; i < files.length; i += 1) {
            db.run(query.SQL_UPDATE_IGNORED_FILES, files[i]);
          }
          db.run('commit', () => {
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        reject(new Error('Ignore files were not successfully retrieved'));
      }
    });
  }

  unignored(files: number[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run('begin transaction');
          for (let i = 0; i < files.length; i += 1) {
            db.run(query.SQL_UPDATE_UNIGNORED_FILES, files[i]);
          }
          db.run('commit', () => {
            db.close();
            resolve(true);
          });
        });
      } catch (error) {
        reject(new Error('Unignore files were not successfully retrieved'));
      }
    });
  }

  private getByPath(file: Partial<File>) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.get(query.SQL_GET_FILE_BY_PATH,
            file.path,
            (err: any, data: any) => {
              if (data.identified === 0 && data.ignored === 0) {
                data.pending = 1;
              } else {
                data.pending = 0;
              }
              db.close();
              if (err) resolve(undefined);
              else resolve(data);
            }
          );
        });
      } catch (error) {
        reject(new Error('File were not successfully retrieved'));
      }
    });
  }
}
