/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-else-return */
/* eslint-disable consistent-return */
/* eslint-disable import/no-cycle */
/* eslint-disable prettier/prettier */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-syntax */
import log from 'electron-log';
import { Querys } from './querys_db';
import { Db } from './db';
import { Component, ComponentGroup } from '../../api/types';
import { LicenseDb } from './scan_license_db';


export interface ComponentParams {
  source?: ComponentSource;
  path?: string;
}

export enum ComponentSource {
  ENGINE = 'engine',
}

const query = new Querys();

export class ComponentDb extends Db {
  license: LicenseDb;

  constructor(path: string) {
    super(path);
    this.license = new LicenseDb(path);
  }

  get(component:number) {
    return new Promise(async (resolve, reject) => {
      try {
        let comp: any;
        if (component) {
          comp = await this.getById(component);
          const summary = await this.summaryByPurlVersion(comp);
          comp.summary = summary;
          resolve(comp);
        } else resolve([]);
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  getAll(data: any, params?: ComponentParams) {
    return new Promise <Component>(async (resolve, reject) => {
      try {
        let component: any;
        if (data.purl && data.version)        
          component = await this.getbyPurlVersion(data);        
        else if (data.purl) {
          component = await this.getByPurl(data);
        } else {
          component = await this.allComp(params);
        }
        if (component !== undefined) resolve(component);
        else throw new Error("Unable to get components");
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  private processComponent(data: any) {
    const results: any = [];

    for (let i = 0; i < data.length; i += 1) {
      const transformation: any = {};
      const preLicense: any = {};
      transformation.compid = data[i].compid;
      transformation.licenses = [];
      transformation.name = data[i].comp_name;
      transformation.purl = data[i].purl;
      transformation.url = data[i].comp_url;
      transformation.version = data[i].version;
      if (data[i].filesCount) transformation.filesCount = data[i].filesCount;

      if (data[i].license_id) {
        preLicense.id = data[i].license_id;
        preLicense.name = data[i].license_name;
        preLicense.spdxid = data[i].license_spdxid;
        transformation.licenses.push(preLicense);
      }
      results.push(transformation);
      let countMerged = 0;
      for (let j = i + 1; j < data.length; j += 1) {
        if (data[i].compid < data[j].compid) break;

        if (data[i].compid === data[j].compid) {
          this.mergeComponents(results[results.length - 1], data[j]);
          countMerged += 1;
        }
      }
      i += countMerged;
    }
    return results;
  }

  // merge component b into a
  private mergeComponents(a: any, b: any) {
    const preLicense: any = {};
    preLicense.id = b.license_id;
    preLicense.name = b.license_name;
    preLicense.spdxid = b.license_spdxid;
    a.licenses.push(preLicense);
  }

  private allComp(params: ComponentParams) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        let sqlGetComp ='';
        if(params.source === ComponentSource.ENGINE) {
          sqlGetComp = query.SQL_GET_ALL_DETECTED_COMPONENTS
        }else if(params.path) {
          sqlGetComp = query.SQL_GET_ALL_DETECTED_COMPONENTS.replace('#', `${params.path}%`);
        }else{
         sqlGetComp =  query.SQL_GET_ALL_COMPONENTS;
        }      
        const db = await this.openDb();
        db.serialize(function () {
          db.all(sqlGetComp, async (err: any, data: any) => {
            db.close();
            if (err) throw err;
            else {
              const comp = self.processComponent(data);
              const summary: any = await self.allSummaries();
              for (let i = 0; i < comp.length; i += 1) {
                comp[i].summary = summary[comp[i].compid];
              }
              resolve(comp);
            }
          });
        });
      } catch (error) {       
        log.error(error);
        reject(error);
      }
    });
  }

  // GET COMPONENENT ID FROM PURL
  private getByPurl(data: any) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          query.SQL_GET_COMPONENT_BY_PURL_ENGINE,
          data.purl,
          data.purl,
          async (err: any, component: any) => {
            db.close();
            if (err) throw err;
            // Attach licenses to a component
            const comp = self.processComponent(component);
            resolve(comp);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // GET COMPONENENT ID FROM PURL
  private getbyPurlVersion(data: any) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(
          query.SQL_GET_COMPONENT_BY_PURL_VERSION,
          data.purl,
          data.version,
          async (err: any, component: any) => {
            db.close();
            if (err) throw err;
            // Attach license to a component
            self.processComponent(component);
            const licenses = await self.getAllLicensesFromComponentId(
              component.compid
            );
            component.licenses = licenses;
            const summary = await this.summaryByPurlVersion(component);
            component.summary = summary;
            resolve(component);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // CREATE COMPONENT
  create(component: any) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.run(
            query.COMPDB_SQL_COMP_VERSION_INSERT,
            component.name,
            component.version,
            component.description ? component.description : 'n/a',
            component.url ? component.url : null,
            component.purl,
            'manual',
            async function (this: any, err: any) {
              db.close();
              if (err) throw err;
              if (this.lastID === 0)
                reject(new Error('Component already exists'));
              await self.license.licenseAttach({
                license_id: component.license_id,
                compid: this.lastID,
              });
              const newComp = await self.get(this.lastID);
              resolve(newComp);
            }
          );
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // GET COMPONENT VERSIONS
  private getById(id: number) {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.get(
            query.SQL_GET_COMPONENT_BY_ID,
            `${id}`,
            async function (err: any, data: any) {
              db.close();
              if (err) throw err;
              else {
                const licenses = await self.getAllLicensesFromComponentId(
                  data.compid
                );
                data.licenses = licenses;
                resolve(data);
              }
            }
          );
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // GET LICENSE ATTACHED TO A COMPONENT
  private getAllLicensesFromComponentId(id: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          db.all(
            query.SQL_GET_LICENSES_BY_COMPONENT_ID,
            `${id}`,
            (err: any, data: any) => {
              db.close();
              if (err) throw err;
              else resolve(data);
            }
          );
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  // IMPORT UNIQUE RESULTS TO COMP DB FROM JSON RESULTS
  importUniqueFromFile() {
    const self = this;
    const attachLicComp: any = {};
    let license: any = {};
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        const results = await this.getUnique();
        db.serialize(async function () {
          db.run('begin transaction');
          for (const result of results) {
            if (result.license !== null) {
              license.spdxid = result.license;
              attachLicComp.license_id = await self.license.getLicenseIdFilter(
                license
              );
              if (attachLicComp.license_id === 0) {
                license = await self.license.bulkCreate(db, license);
                attachLicComp.license_id = license.id;
              }
            }
            attachLicComp.compid = await self.componentNewImportFromResults(
              db,
              result
            );
            if (result.license !== 'NULL')
              await self.license.bulkAttachLicensebyId(db, attachLicComp);
          }
          db.run('commit', (err: any) => {
            if (err) throw err;
            db.close();          
            resolve(true);
          });
        });
      } catch (error) {
        log.error(error);
        resolve(false);
      }
    });
  }

  // COMPONENT NEW
  private componentNewImportFromResults(db: any, data: any) {
    return new Promise<number>((resolve) => {
      db.serialize(function () {
        db.run(
          query.COMPDB_SQL_COMP_VERSION_INSERT,
          data.component,
          data.version,
          'AUTOMATIC IMPORT',
          data.url,
          data.purl,
          'engine'
        );
        db.get(
          `SELECT id FROM component_versions WHERE purl=? AND version=?;`,
          data.purl,
          data.version,
          (err: any, comp: any) => {
            if (err) log.error(err);
            resolve(comp.id);
          }
        );
      });
    });
  }

  update(component: Component) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.serialize(function () {
          const stmt = db.prepare(query.SQL_COMPDB_COMP_VERSION_UPDATE);
          stmt.run(
            component.name,
            component.version,
            component.description,
            component.url,
            component.purl,
            component.description,
            component.compid,
            (err: any) => {
              if (err) throw err;
            }
          );
          db.close();
          stmt.finalize();
          resolve(true);
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  private async getUnique() {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_UNIQUE_COMPONENT, (err: any, data: any) => {
          db.close();
          if (err) throw err;
          resolve(data);
        });
      } catch (error: any) {
        log.error(error);
        reject(error);
      }
    });
  }

  private allSummaries() {
    const self = this;
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(query.SQL_GET_ALL_SUMMARIES, (err: any, data: any) => {
          db.close();
          if (err) throw err;
          else {
            const summary = self.groupSummaryByCompid(data);
            resolve(summary);
          }
        });
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  private groupSummaryByCompid(data: any) {
    const aux = {};
    for (const i of data) {
      const key = i.compid;
      const value = i;
      if (!aux.hasOwnProperty(i.compid)) aux[`${key}`];
      aux[`${key}`] = value;
    }
    return aux;
  }

  private summaryByPurlVersion(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(
          query.SQL_GET_SUMMARY_BY_PURL_VERSION,
          data.purl,
          data.version,
          (err: any, summary: any) => {
            db.close();
            if (err) throw err;
            else resolve(summary);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  private summaryByPurl(data: any) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.get(
          query.SQL_GET_SUMMARY_BY_PURL,
          data.purl,
          (err: any, summary: any) => {
            db.close();
            if (err)
              resolve({
                identified: 0,
                pending: 0,
                ignored: 0,
              });
            else resolve(summary);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  async getComponentGroup(component: Partial<ComponentGroup>) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.getAll(component);
        if (data) {
          const [comp] = await this.groupComponentsByPurl(data);
          comp.summary = await this.summaryByPurl(comp);
          resolve(comp);
        } else resolve([]);
      } catch (error) {
        log.error(error);
        reject(new Error('Unable to get components grouped by purl'));
      }
    });
  }

  async getAllComponentGroup(params: ComponentParams) {    
    return new Promise(async (resolve, reject) => {
      try {     
        const data = await this.getAll({}, params);
        if (data) {        
          const comp = await this.groupComponentsByPurl(data);       
         
          resolve(comp);
        } else resolve([]);
      } catch (error) {        
        reject(new Error('Unable to get all component group'));
      }
    });
  }

  private async groupComponentsByPurl(data: any) {
    try {
      const aux = {};
      for (const component of data) {
        if (!aux.hasOwnProperty(component.purl)) aux[component.purl] = [];
        aux[component.purl].push(component);
      }
      const result = await this.mergeComponentByPurl(aux);
      return result;
    } catch (err) {     
      log.error(err);
      return 'Unable to group components';
    }
  }

  private mergeComponentByPurl(data: Record<string, any>) {   
    return new Promise<any[]>(async (resolve) => {
      const result: any[] = [];
      for (const [key, value] of Object.entries(data)) {
        const aux: any = {};
        aux.summary = { ignored: 0, pending: 0, identified: 0 };
        aux.versions = [];
        for (const iterator of value) {
          aux.name = iterator.name;
          aux.purl = iterator.purl;
          aux.url = iterator.url;
          const version: any = {};
          if (iterator.summary) {
            aux.summary.ignored += iterator.summary.ignored;
            aux.summary.pending += iterator.summary.pending;
            aux.summary.identified += iterator.summary.identified;
          }
          version.version = iterator.version;
          version.files = iterator.filesCount;
          version.licenses = [];
          version.licenses = iterator.licenses;
          version.cvid=iterator.compid;
          aux.versions.push(version);
        }
        result.push(aux);
      }
      result.sort((a, b) => a.name.localeCompare(b.name));
      resolve(result);
    });
  }

  public getIdentifiedForReport() {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          `SELECT DISTINCT c.id,c.name AS comp_name , c.version, c.purl,c.url,l.name AS license_name, l.spdxid
        FROM component_versions c
        INNER JOIN inventories i ON c.id=i.cvid
        INNER JOIN licenses l ON l.spdxid=i.spdxid ORDER BY i.spdxid;`,
          (err: any, data: any) => {
            db.close();
            if (err) throw err;
            resolve(data);
          }
        );
      } catch (error) {
        log.error(error);
        reject(error);
      }
    });
  }

  public getNotValid() {
    return new Promise <number[]> (async (resolve, reject) => {
      try {
        const db = await this.openDb();
        db.all(
          `SELECT DISTINCT cv.id FROM (
            SELECT notValid.purl,notValid.version FROM results notValid WHERE NOT EXISTS 
            (SELECT valid.purl,valid.version FROM results valid WHERE valid.dirty=0 AND notValid.purl=valid.purl AND notValid.version=valid.version)
             ) AS possibleNotValid
             INNER JOIN component_versions cv ON cv.purl=possibleNotValid.purl AND cv.version=possibleNotValid.version
             WHERE cv.id NOT IN (SELECT cvid FROM inventories);`,
          (err: any, data: any) => {
            db.close();
            if (err) throw err;  
            const ids:number[] = data.map((item:Record<string,number>) => item.id );         
            resolve(ids);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public deleteByID( componentIds: number[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();
        let deleteCompByIdQuery = "DELETE FROM component_versions WHERE id in ";
        deleteCompByIdQuery += `(${componentIds.toString()});`;      
        db.all(deleteCompByIdQuery,
          (err: any) => {
            db.close();
            if (err) throw err;
            resolve(true);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public async updateOrphanToManual(){
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDb();       
        db.run(`UPDATE component_versions  SET source='manual' WHERE  id IN ( SELECT i.cvid FROM inventories i INNER JOIN component_versions cv ON cv.id=i.cvid WHERE (cv.purl,cv.version) NOT IN (SELECT r.purl,r.version FROM results r));`,
          (err: any) => {
            db.close();
            if (err) throw err;
            resolve(true);
          }
        );
      } catch (error) {
        reject(error);
      }
    });

  }

  
}
