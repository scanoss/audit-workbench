import log from 'electron-log';
import { IpcEvents } from '../../api/ipc-events';
import { NodeStatus } from '../workspace/Tree/Tree/Node';
import { Tree } from '../workspace/Tree/Tree/Tree';
import { workspace } from '../workspace/Workspace';
import {utilHelper} from "../helpers/UtilHelper";
import {FilterTrue} from "../batch/Filter/FilterTrue";
import {modelProvider} from "./ModelProvider";

class TreeService {
  public init(event: Electron.WebContents, projectPath: string, scanRoot:string): Tree {
    try {
      const tree = new Tree(scanRoot, event);
      tree.buildTree();
      tree.fileTreeFilter(projectPath, scanRoot);
      tree.summarize(scanRoot);
      return tree;
    } catch (e: any) {
      log.error(e);
      throw e;
    }
  }

  private updateStatus(paths: Array<string>, status: NodeStatus) {
    try {
      const project = workspace.getOpenedProjects()[0];
      project.getTree().sendToUI(IpcEvents.TREE_UPDATING, {});
      paths.forEach((path) => {
        project.getTree().getRootFolder().setStatus(path, status);
      });

    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public updateStart(): void {
    const project = workspace.getOpenedProjects()[0];
    project.getTree().sendToUI(IpcEvents.TREE_UPDATING, {});
  }

  public updateDone(): void {
    const project = workspace.getOpenedProjects()[0];
    project.updateTree();
  }

  public async updateTree(ids: Array<number>, status: NodeStatus): Promise<boolean> {
    this.updateStart()
     return modelProvider.model.result.getSummaryByids(ids).then((results) => {
        const paths = utilHelper.getArrayFromObjectFilter(results, 'path', new FilterTrue()) as Array<string>;
        this.updateStatus(paths, status);
        this.updateDependencyStatus();
        return true;
      })
      .catch((error) => {
        throw error;
      });
  }

  private async getDependencyStatus() : Promise <Array<Record<string,any>>> {
    const dependencies = await modelProvider.model.dependency.getStatus(); // getAll
    const dep = this.mapToDependencyStatus(dependencies);
    return dep;
  }

  private mapToDependencyStatus(dependencies) : Array<Record<string,any>> {
      // Group path and dependencies status
    const status = {};
      dependencies.forEach(item => {
        if (!status[item.path]) {
          const aux = new Set();
          aux.add(item.status);
          status[item.path] = {
            status: aux,
            fileId: item.fileId
          };
        } else
          status[item.path].status.add(item.status);
      });
      // Get dependencies status for each path
    const dependencyStatus = [];
      for (const [path, data] of Object.entries(status as Record<string, any>)) {
        let depStat = "";
        if( data.status.has("IGNORED"))
          depStat = "IGNORED";
        if( data.status.has("IDENTIFIED"))
          depStat = "IDENTIFIED";
        if(data.status.has("PENDING"))
          depStat = "PENDING";
        dependencyStatus.push({
          path,
          fileId: data.fileId,
          status: depStat,
        });
      }
      return dependencyStatus;
  }

  public updateDependencyStatusOnTree() {
    this.updateStart()
    this.updateDependencyStatus();
  }

  private async updateDependencyStatus(): Promise<boolean>  {
    this.getDependencyStatus().then((dep) => {
      const depGroupedByStatus = dep.reduce((acc, item) => {
        if (!acc[item.status]) {
          acc[item.status] = [];
        }
        acc[item.status].push(item.fileId);
        return acc;
      }, {});
      if(depGroupedByStatus.PENDING)
         modelProvider.model.file.restore(depGroupedByStatus.PENDING);
      if(depGroupedByStatus.IDENTIFIED)
        modelProvider.model.file.identified(depGroupedByStatus.IDENTIFIED);
      if(depGroupedByStatus.IGNORED)
        modelProvider.model.file.ignored(depGroupedByStatus.IGNORED);

      dep.forEach((d) => {
        this.updateStatus([d.path], d.status as NodeStatus);
     });
      this.updateDone();
    });
    return true;
  }
}

export const treeService = new TreeService();
