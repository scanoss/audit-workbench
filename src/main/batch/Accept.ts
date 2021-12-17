import { Inventory } from '../../api/types';
import { logicInventoryService } from '../services/LogicInventoryService';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { workspace } from '../workspace/Workspace';
import { Batch } from './Batch';

import { Restore } from './Restore';

export class Accept extends Batch {
  private inventories: Partial<Array<Inventory>>;

  private note: string;

  constructor(folder: string, overwrite: boolean, inventories: Partial<Array<Inventory>>, note: string) {
    super(folder, overwrite);
    this.note = note;
    this.inventories = inventories;
  }

  public async execute() {
    try {
      if (this.getOverWrite()) {
        await new Restore(this.getFolder(), this.getOverWrite()).execute();
      }
      const ids = this.getFilesToUpdateFromInventories(this.inventories);
      if (this.note) {
        this.inventories.forEach((inventory) => {
          inventory.notes = this.note;
        });
      }
      const inv = await logicInventoryService.InventoryBatchCreate(this.inventories);
      const filesToUpdate: any = this.mergeFilesInventoryId(inv);
      filesToUpdate.files = ids;
      const success = await logicInventoryService.InventoryAttachFileBatch(filesToUpdate);
      if (success) {
        this.updateTree(ids, NodeStatus.IDENTIFIED);
        return inv;
      }
      throw new Error('inventory accept failed');
    } catch (e: any) {
      return e;
    }
  }

  private getFilesToUpdateFromInventories(inventories: Array<Inventory>) {
    const files: Array<number> = [];
    inventories.forEach((inventory) => {
      files.push(...inventory.files);
    });
    return files;
  }

  private mergeFilesInventoryId(inventories: Array<Inventory>) {
    let aux = '';
    inventories.forEach((inventory) => {
      inventory.files.forEach((file) => {
        aux += `(${file},${inventory.id}),`;
      });
    });

    const result = aux.substring(0, aux.length - 1);
    return { invFiles: result };
  }
}
