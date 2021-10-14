import fs from 'fs';
import { IWorkspaceCfg } from '../../../api/types';

export function wsCfgUpdate(wsPath: string) { 
  const cfgData = fs.readFileSync(`${wsPath}/defaultCfg.json`, 'utf8');
  const settings = JSON.parse(cfgData);
  const newWsConfig: any = {};
  newWsConfig.TOKEN = settings.TOKEN;
  newWsConfig.SCAN_MODE = settings.TOKEN;
  newWsConfig.DEFAULT_API_INDEX = settings.DEFAULT_URL_API;
  newWsConfig.APIS = [];
  newWsConfig.VERSION = '0.12.0';
  for (let i = 0; i < settings.AVAILABLE_URL_API.length; i += 1) {
    const aux: any = {};
    aux.URL = settings.AVAILABLE_URL_API[i];
    aux.API_KEY = '';
    aux.DESCRIPTION = '';
    newWsConfig.APIS.push(aux);
  }
  fs.writeFileSync(`${wsPath}/workspaceCfg.json`, JSON.stringify(newWsConfig, undefined, 2), 'utf8');
  fs.unlinkSync(`${wsPath}/defaultCfg.json`);
}


export function updateVersion(wsPath :string){
  console.log("UPDATING...");
}

