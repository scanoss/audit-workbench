import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Tab,
  Tabs,
} from '@material-ui/core';
import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { WorkbenchContext, IWorkbenchContext } from '../../store';
import { AppContext, IAppContext } from '../../../context/AppProvider';
import { Inventory } from '../../../../api/types';
import { FileList } from '../ComponentList/components/FileList';
import { InventoryList } from '../ComponentList/components/InventoryList';
import { ComponentInfo } from '../../components/ComponentInfo/ComponentInfo';
import { DialogContext, IDialogContext } from '../../../context/DialogProvider';
import { setFile } from '../../actions';
import { inventoryService } from '../../../../api/inventory-service';
import { componentService } from '../../../../api/component-service';

import { mapFiles } from '../../../../utils/scan-util';
import { MATCH_CARD_ACTIONS } from '../../components/MatchCard/MatchCard';
import { DIALOG_ACTIONS } from '../../../context/types';

export const ComponentDetail = () => {
  const history = useHistory();

  const { scanBasePath } = useContext(AppContext) as IAppContext;
  const { state, dispatch, createInventory, ignoreFile, restoreFile, attachFile } = useContext(
    WorkbenchContext
  ) as IWorkbenchContext;
  const dialogCtrl = useContext(DialogContext) as IDialogContext;

  const { component } = state;

  const [files, setFiles] = useState<any[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<number>(component?.summary?.pending !== 0 ? 0 : 1);

  const getFiles = async () => {
    const response = await componentService.getFiles({ purl: component.purl, version: component.version });
    console.log('FILES BY COMP', response);
    setFiles(mapFiles(response.data));
  };

  const getInventories = async () => {
    const response = await inventoryService.getAll({ purl: component.purl, version: component.version });
    console.log('INVENTORIES BY COMP', response);
    setInventories(response.message || []);
  };

  const onAction = (file: string, action: MATCH_CARD_ACTIONS) => {
    switch (action) {
      case MATCH_CARD_ACTIONS.ACTION_ENTER:
        history.push(`/workbench/file?path=${file.path}`);
        break;
      case MATCH_CARD_ACTIONS.ACTION_IDENTIFY:
        onIdentifyPressed(file);
        break;
      case MATCH_CARD_ACTIONS.ACTION_IGNORE:
        onIgnorePressed(file);
        break;
      case MATCH_CARD_ACTIONS.ACTION_RESTORE:
        onRestorePressed(file);
        break;
      default:
        break;
    }
  };

  const onIdentifyPressed = async (file) => {
    const inv = {
      component: component?.name,
      version: component?.version,
      license: component?.licenses[0]?.name,
      url: component?.url,
      purl: component?.purl,
      usage: file.type,
    };

    create(inv, [file.id]);
  };

  const onIdentifyAllPressed = async () => {
    const selFiles = files
      .filter((file) => file.status === 'pending')
      .map((file) => file.id);

    const inv = {
      component: component?.name,
      version: component?.versions[0].version,
      license: component?.versions[0].licenses[0]?.name,
      url: component?.url,
      purl: component?.purl,
      usage: 'file',
    };

    create(inv, selFiles);
  };

  const onIgnorePressed = async (file) => {
    await ignoreFile([file.id]);
    getFiles();
  };

  const onIgnoreAllPressed = async () => {
    const selFiles = files.filter((file) => file.status === 'pending').map((file) => file.id);
    await ignoreFile(selFiles);
    getFiles();
  };

  const onRestoreAllPressed = async () => {
    const selFiles = files.filter((file) => file.status === 'ignored').map((file) => file.id);
    await restoreFile(selFiles);
    getFiles();
  };

  const onRestorePressed = async (file) => {
    await restoreFile([file.id]);
    getFiles();
  };

  const create = async (defaultInventory, selFiles) => {
    const showSelector = inventories.length > 0;
    let action = DIALOG_ACTIONS.NEW;
    let inventory;

    if (showSelector) {
      const response = await dialogCtrl.openInventorySelector(inventories);
      action = response.action;
      inventory = response.inventory;
    }

    if (action === DIALOG_ACTIONS.CANCEL) return;

    if (action === DIALOG_ACTIONS.NEW) {
      inventory = await dialogCtrl.openInventory(defaultInventory);
      if (!inventory) return;

      const newInventory = await createInventory({
        ...inventory,
        files: selFiles,
      });
      setInventories((previous) => [...previous, newInventory]);
    } else if (action === DIALOG_ACTIONS.OK) {
      await attachFile(inventory.id, selFiles);
    }

    getFiles();
    setTab(1);
  };

  const handleCloseButtonGroup = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    getFiles();
    getInventories();
  }, []);

  const renderTab = () => {
    switch (tab) {
      case 0:
        return <FileList files={files} filter="pending" onAction={onAction} />;
      case 1:
        return <InventoryList inventories={inventories} />;
      case 2:
        return <FileList files={files} filter="ignored" onAction={onAction} />;
      default:
        return 'no data';
    }
  };

  return (
    <>
      <section className="app-page">
        <header className="app-header">
          <div className="header">
            <div>
              <h4 className="header-subtitle back">
                <IconButton onClick={() => history.goBack()} component="span">
                  <ArrowBackIcon />
                </IconButton>
                {scanBasePath}
              </h4>

              <h1 className="header-title">Matches</h1>
            </div>

            <ComponentInfo component={component} />
          </div>

          <section className="subheader">
            <div className="tabs">
              <Paper square>
                <Tabs
                  value={tab}
                  indicatorColor="primary"
                  textColor="primary"
                  onChange={(event, value) => setTab(value)}
                >
                  <Tab label={`Pending (${component?.summary.pending})`} />
                  <Tab label={`Identified (${component?.summary.identified})`} />
                  <Tab label={`Ignored (${component?.summary.ignored})`} />
                </Tabs>
              </Paper>
            </div>

            {tab === 0 && (
              <>
                <ButtonGroup
                  disabled={component?.summary.pending === 0}
                  ref={anchorRef}
                  variant="contained"
                  color="secondary"
                  aria-label="split button"
                >
                  <Button variant="contained" color="secondary" onClick={onIdentifyAllPressed}>
                    Identify All ({component?.summary.pending})
                  </Button>
                  <Button color="secondary" size="small" onClick={() => setOpen((prevOpen) => !prevOpen)}>
                    <ArrowDropDownIcon />
                  </Button>
                </ButtonGroup>
                <Popper open={open} anchorEl={anchorRef.current} transition disablePortal>
                  <Paper>
                    <ClickAwayListener onClickAway={handleCloseButtonGroup}>
                      <MenuList id="split-button-menu">
                        <MenuItem
                          key="test"
                          onClick={() => {
                            setOpen(false);
                            onIgnoreAllPressed();
                          }}
                        >
                          Ignore All ({component?.summary.pending})
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Popper>
              </>
            )}
            {tab === 2 && (
              <Button
                disabled={component?.summary.ignored === 0}
                variant="contained"
                color="secondary"
                onClick={onRestoreAllPressed}
              >
                Restore All ({component?.summary.ignored})
              </Button>
            )}
          </section>
        </header>

        <main className="app-content">{renderTab()}</main>
      </section>
    </>
  );
};

export default ComponentDetail;
