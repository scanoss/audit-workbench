import { Inventory } from '../../api/types';

export enum DIALOG_ACTIONS {
  OK = 'ok',
  CANCEL = 'cancel',
  NEW = 'new',
}

export interface InventorySelectorResponse {
  action: DIALOG_ACTIONS;
  inventory?: Inventory | null;
}

export interface InventoryForm {
  id?: string;
  component: string;
  version: string;
  license: string;
  url: string;
  purl: string;
  usage: string;
  notes: string;
}