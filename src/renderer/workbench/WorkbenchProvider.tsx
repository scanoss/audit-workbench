import React, { useContext, useEffect, useState } from 'react';
import { workbenchController } from '../workbench-controller';
import { AppContext } from '../context/AppProvider';
import { Inventory } from '../../api/types';
import { inventoryService } from '../../api/inventory-service';
import * as scanUtil from '../../utils/scan-util';

export interface Component {
  name: string;
  vendor: string;
  version: string;
  latest: string;
  url: string;
  purl: string[];
  licenses: any[];
  files: string[];
  count: {
    all: number;
    pending: number;
    ignored: number;
    identified: number;
  };
}

export interface IWorkbenchContext {
  loadScan: (path: string) => Promise<boolean>;
  createInventory: (inventory: Inventory) => Promise<Inventory>;

  scan: Record<string, any> | null;
  tree: [] | null;
  file: string | null;
  components: Record<string, Component> | null;
  component: Component | null;
  matchInfo: Record<string, any>[] | null;
  setFile: (file: string) => void;
  setTree: (tree: []) => void;
  setComponent: (component) => void;
  resetWorkbench: () => void;
}

export const WorkbenchContext = React.createContext<IWorkbenchContext | null>(
  null
);

export const WorkbenchProvider: React.FC<IWorkbenchContext> = ({
  children,
}) => {
  const { scanBasePath } = useContext<any>(AppContext);

  const [tree, setTree] = useState<[] | null>(null);
  const [scan, setScan] = useState<Record<string, any> | null>(null);

  const [components, setComponents] = useState<Record<
    string,
    Component
  > | null>(null);
  const [component, setComponent] = useState<Component | null>(null);

  const [file, setFile] = useState<string | null>(null);

  const [matchInfo, setMatchInfo] = useState<Record<string, any>[] | null>(
    null
  );

  const loadScan = async (path: string) => {
    try {
      const scanResult = await workbenchController.loadScan(path);
      setScan(scanResult.scan);
      setTree(scanResult.fileTree);
      setComponents(scanResult.components);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const createInventory = async (inventory: Inventory) => {
    const response = await inventoryService.create({
      ...inventory,
      files: component ? component.files : [],
    });
    const updateScan = scanUtil.updateTree(scan, inventory);
    setScan({ ...scan, ...updateScan });
    const updateComponents = scanUtil.getComponents(scan);
    setComponents(updateComponents);
    return inventory;
  };

  const resetWorkbench = () => {
    console.log('reset workbench provider');
    setFile(null);
    setScan(null);
    setTree(null);
    setComponents(null);
    setComponents(null);
  };

  useEffect(() => {
    if (scan && file) {
      const match = scan[file];
      if (match[0].id !== 'none') {
        setMatchInfo(match);
      } else {
        setMatchInfo(null);
      }
    }
  }, [file, scan]);

  return (
    <WorkbenchContext.Provider
      value={{
        loadScan,
        createInventory,
        scan,
        tree,
        setTree,
        file,
        matchInfo,
        setFile,
        components,
        component,
        setComponent,
        resetWorkbench,
      }}
    >
      {children}
    </WorkbenchContext.Provider>
  );
};

export default WorkbenchProvider;
