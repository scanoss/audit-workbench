import Node from './Node';

export default class File extends Node {
  constructor(name: string, path: string) {
    super(name, path);
    this.type = 'file';
  }

  public updateStatus(path: string, status: string): boolean {
    if (this.value === path) {
      this.status = status;
      return true;
    }
    return false;
  }

  public updateClassName(path: string, className: string): boolean {

    return true;
  }

  public getNode(path: string): Node {
    if (path === this.getPath()) return this;
    return null;
  }
}
