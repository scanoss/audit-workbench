/* eslint-disable import/no-cycle */

import React, { useState } from 'react';
import { InventoryDialog } from '../ui/dialog/InventoryDialog';
import { Component, Inventory, License, NewComponentDTO } from '../../api/types';
import { InventorySelectorDialog } from '../workbench/components/InventorySelectorDialog/InventorySelectorDialog';
import { DIALOG_ACTIONS, DialogResponse, InventoryForm, InventorySelectorResponse } from './types';
import { ConfirmDialog } from '../ui/dialog/ConfirmDialog';
import { LicenseDialog } from '../ui/dialog/LicenseDialog';
import { ComponentDialog } from '../ui/dialog/ComponentDialog';

export interface IDialogContext {
  openInventory: (inventory: Partial<InventoryForm>) => Promise<Inventory | null>;
  openInventorySelector: (inventories: Inventory[]) => Promise<InventorySelectorResponse>;
  openConfirmDialog: (message?: string, button?: any, hideDeleteButton?: boolean) => Promise<DialogResponse>;
  openLicenseCreate: () => Promise<DialogResponse>;
  openComponentDialog: (component: Partial<NewComponentDTO>, label: string) => Promise<DialogResponse>;
}

export const DialogContext = React.createContext<IDialogContext | null>(null);

export const DialogProvider: React.FC = ({ children }) => {
  const [inventoryDialog, setInventoryDialog] = useState<{
    open: boolean;
    inventory: Partial<InventoryForm>;
    onClose?: (inventory) => void;
  }>({ open: false, inventory: {} });

  const openInventory = (inventory: Partial<InventoryForm>): Promise<Inventory | null> => {
    return new Promise<Inventory>((resolve) => {
      setInventoryDialog({
        inventory,
        open: true,
        onClose: (inv) => {
          setInventoryDialog((dialog) => ({ ...dialog, open: false }));
          resolve(inv);
        },
      });
    });
  };

  const [inventorySelectorDialog, setInventorySelectorDialog] = useState<{
    open: boolean;
    inventories: Inventory[];
    onClose?: (response: InventorySelectorResponse) => void;
  }>({ open: false, inventories: [] });

  const openInventorySelector = (inventories: Inventory[]): Promise<InventorySelectorResponse> => {
    return new Promise<InventorySelectorResponse>((resolve) => {
      setInventorySelectorDialog({
        inventories,
        open: true,
        onClose: (response) => {
          setInventorySelectorDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message?: string;
    button?: any;
    hideDeleteButton?: boolean;
    onClose?: (response: DialogResponse) => void;
  }>({ open: false });

  const openConfirmDialog = (
    message = 'Are you sure?',
    button: {
      label: string;
      role: 'accept' | 'cancel' | 'delete';
    } = {
      label: 'OK',
      role: 'accept',
    },
    hideDeleteButton = false
  ): Promise<DialogResponse> => {
    return new Promise<DialogResponse>((resolve) => {
      setConfirmDialog({
        open: true,
        message,
        button,
        hideDeleteButton,
        onClose: (response) => {
          setConfirmDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [licenseDialogSelector, setLicenseDialog] = useState<{
    open: boolean;
    onClose?: (response: DialogResponse) => void;
  }>({ open: false });

  const openLicenseCreate = () => {
    return new Promise<DialogResponse>((resolve) => {
      setLicenseDialog({
        open: true,
        onClose: (response) => {
          setLicenseDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  const [componentDialog, setComponentDialog] = useState<{
    open: boolean;
    component: Partial<NewComponentDTO>;
    label?: string;
    onClose?: (response: DialogResponse) => void;
  }>({ open: false , component: {} });

  const openComponentDialog = (component: Partial<NewComponentDTO> = {}, label = 'Create Component') => {
    return new Promise<DialogResponse>((resolve) => {
      setComponentDialog({
        open: true,
        component,
        label,
        onClose: (response) => {
          setComponentDialog((dialog) => ({ ...dialog, open: false }));
          resolve(response);
        },
      });
    });
  };

  return (
    <DialogContext.Provider
      value={{ openInventory, openInventorySelector, openConfirmDialog, openLicenseCreate, openComponentDialog }}
    >
      {children}
      <InventoryDialog
        open={inventoryDialog.open}
        inventory={inventoryDialog.inventory}
        onCancel={() => inventoryDialog.onClose && inventoryDialog.onClose(null)}
        onClose={(inventory) => inventoryDialog.onClose && inventoryDialog.onClose(inventory)}
      />

      <InventorySelectorDialog
        open={inventorySelectorDialog.open}
        inventories={inventorySelectorDialog.inventories}
        onClose={(response) => inventorySelectorDialog.onClose && inventorySelectorDialog.onClose(response)}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        hideDeleteButton={confirmDialog.hideDeleteButton}
        message={confirmDialog.message}
        button={confirmDialog.button}
        onClose={(response) => confirmDialog.onClose && confirmDialog.onClose(response)}
      />

      <ComponentDialog
        open={componentDialog.open}
        label={componentDialog.label}
        component={componentDialog.component}
        onCancel={() => componentDialog.onClose && componentDialog.onClose(null)}
        onClose={(response) => componentDialog.onClose && componentDialog.onClose(response)}
      />

      <LicenseDialog
        open={licenseDialogSelector.open}
        onCancel={() => licenseDialogSelector.onClose && licenseDialogSelector.onClose(null)}
        onClose={(response) => licenseDialogSelector.onClose && licenseDialogSelector.onClose(response)}
      />
    </DialogContext.Provider>
  );
};

export default DialogProvider;
