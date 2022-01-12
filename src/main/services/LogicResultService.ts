import { workspace } from '../workspace/Workspace';

class LogicResultService {
  public async getResultsByids(ids: number[], project: any) {
    try {
      const results: Array<any> = await project.store.results.getSummaryByids(ids);
      const response = {};
      results.forEach((element: any) => {
        if (response[element.path] === undefined) {
          response[element.path] =
            element.identified === 1 ? 'identified' : element.ignored === 1 ? 'ignored' : 'pending';
        }
      });

      return response;
    } catch (e) {
      return e;
    }
  }

  public async getFilesInFolder(folder: string) {
    try {
      const project = workspace.getOpenedProjects()[0];
      const results: Array<any> = await project.store.result.getFilesInFolder(folder);
      return results;
    } catch (e) {
      return e;
    }
  }

  public async getResultsFromIDs(ids: number[]) {
    try {
      const project = workspace.getOpenedProjects()[0];
      const results: Array<any> = await project.store.result.getSummaryByids(ids);
      return results;
    } catch (e) {
      return e;
    }
  }

  public async ignore(ids: number[]) {
    try {
      const project = workspace.getOpenedProjects()[0];
      const success = await project.store.file.ignored(ids);
      return success;
    } catch (e) {
      return e;
    }
  }

  public async getFromPath(path: string) {
    try {
      const project = workspace.getOpenedProjects()[0];
      const results = await project.store.result.getFromPath(path);
      const components: any = await project.store.component.allComp();
      results.forEach((result) => {
        if (result.license) result.license = result.license.split(',');
        if (result.version)
          result.component = components.find(
            (component) => component.purl === result.purl && component.version === result.version
          );
        else result.component = null;
      });
      return results;
    } catch (error: any) {
      return error;
    }
  }
}
export const logicResultService = new LogicResultService();
