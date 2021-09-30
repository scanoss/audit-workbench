export enum IpcEvents {
  MENU_NEW_PROJECT = 'MENU_NEW_PROJECT',
  MENU_OPEN_SETTINGS = 'MENU_OPEN_SETTINGS',

  PROJECT_CREATE_SCAN = 'PROJECT_CREATE_SCAN',
  PROJECT_OPEN_SCAN = 'PROJECT_OPEN_SCAN',
  PROJECT_RESUME_SCAN = 'PROJECT_RESUME_SCAN',
  PROJECT_STOP_SCAN = 'PROJECT_STOP_SCAN',

  PROJECT_SET_ROOT = 'PROJECT_SET_ROOT',
  PROJECT_DEFINE_COMPONENTS = 'PROJECT_DEFINE_COMPONENTS',
  PROJECT_DEFINE_LICENSES = 'PROJECT_DEFINE_LICENSES',
  PROJECT_INCLUDE_ITEM = 'PROJECT_INCLUDE_ITEM',

  PROJECT_ADD_FILTER = 'PROJECT_ADD_FILTER',
  PROJECT_DELETE_FILTER = 'PROJECT_DELETE_FILTER',

  SCANNER_INIT_SCAN = 'SCANNER_INIT_SCAN',
  SCANNER_FINISH_SCAN = 'SCANNER_FINISH_SCAN',
  SCANNER_UPDATE_STATUS = 'SCANNER_UPDATE_STATUS',
  SCANNER_ERROR_STATUS = 'SCANNER_ERROR_STATUS',
  SCANNER_RESUME = 'SCANNER_RESUME',
  SCANNER_STOP = 'SCANNER_STOP',

  SCANNER_ABORTED = 'SCANNER_ABORTED',

  UTILS_GET_PROJECT_DTO = 'UTILS_GET_PROJECT_DTO',
  UTILS_PROJECT_NAME = 'UTILS_PROJECT_NAME',
  UTILS_GET_NODE_FROM_PATH = ' UTILS_GET_NODE_FROM_PATH',
  GET_TOKEN = 'GET_TOKEN',

  INVENTORY_CREATE = 'INVENTORY_CREATE',
  INVENTORY_GET = 'INVENTORY_GET',
  INVENTORY_GET_ALL = 'INVENTORY_GET_ALL',
  INVENTORY_DELETE = 'INVENTORY_DELETE',
  INVENTORY_UPDATE = 'INVENTORY_UPDATE',
  INVENTORY_ATTACH_FILE = 'INVENTORY_ATTACH_FILE',
  INVENTORY_DETACH_FILE = 'INVENTORY_DETACH_FILE',
  INVENTORY_FROM_COMPONENT = 'INVENTORY_FROM_COMPONENT',

  COMPONENT_CREATE = 'COMPONENT_CREATE',
  COMPONENT_DELETE = 'COMPONENT_DELETE',
  COMPONENT_GET = 'COMPONENT_GET',
  COMPONENT_GET_ALL = 'COMPONENT_GET_ALL',
  COMPONENT_UPDATE = 'COMPONENT_UPDATE',
  COMPONENT_GET_FILES = 'COMPONENT_GET_FILES',
  COMPONENT_ATTACH_LICENSE = 'COMPONENT_ATTACH_LICENSE',
  COMPONENT_DETACH_LICENSE = 'COMPONENT_DETACH_LICENSE',
  COMPONENT_GROUP_GET_ALL = 'COMPONENT_GROUP_GET_ALL',
  COMPONENT_GROUP_GET = 'COMPONENT_GROUP_GET',


  LICENSE_CREATE = 'LICENSE_CREATE',
  LICENSE_GET = 'LICENSE_GET',
  LICENSE_GET_ALL = 'LICENSE_GET_ALL',
  LICENSE_DELETE = 'LICENSE_DELETE',
  LICENSE_UPDATE = 'LICENSE_UPDATE',

  FILE_GET_CONTENT = 'FILE_GET_CONTENT',
  IGNORED_FILES = 'IGNORED_FILES',
  UNIGNORED_FILES = 'UNIGNORE_FILES',
  FILE_GET = 'FILE_GET',

  RESULTS_GET = 'RESULTS_GET',
  RESULTS_GET_NO_MATCH = 'RESULTS_GET_NO_MATCH',
  RESULTS_ADD_FILTERED_FILE = 'RESULTS_ADD_FILTERED_FILE',
  RESULTS_FORCE_ATTACH = 'RESULTS_FORCE_ATTACH',

  EXPORT = 'EXPORT',
  EXPORT_NOTARIZE_SBOM = ' EXPORT_NOTARIZE_SBOM',

  WORKSPACE_PROJECT_LIST = 'WORKSPACE_PROJECT_LIST',
  WORKSPACE_DELETE_PROJECT = 'WORKSPACE_DELETE_PROJECT',

  REPORT_INVENTORY_PROGRESS = 'REPORT_INVENTORY_PROGRESS',
  REPORT_SUMMARY = 'REPORT_SUMMARY',
  REPORT_DETECTED = 'REPORT_DETECTED',
  REPORT_IDENTIFIED = 'REPORT_IDENTIFIED',
}

export const ipcMainEvents = [
  IpcEvents.SCANNER_UPDATE_STATUS,
  IpcEvents.SCANNER_FINISH_SCAN,
  IpcEvents.SCANNER_ERROR_STATUS,
  IpcEvents.SCANNER_ABORTED,
];

export const ipcRendererEvents = [
  IpcEvents.PROJECT_CREATE_SCAN,
  IpcEvents.PROJECT_SET_ROOT,
  IpcEvents.PROJECT_DEFINE_COMPONENTS,
  IpcEvents.PROJECT_DEFINE_LICENSES,
  IpcEvents.PROJECT_INCLUDE_ITEM,
  IpcEvents.PROJECT_ADD_FILTER,
  IpcEvents.PROJECT_DELETE_FILTER,

  IpcEvents.SCANNER_INIT_SCAN,
  IpcEvents.SCANNER_RESUME,

  IpcEvents.INVENTORY_CREATE,
  IpcEvents.INVENTORY_GET,
  IpcEvents.INVENTORY_GET_ALL,
  IpcEvents.INVENTORY_DELETE,
  IpcEvents.INVENTORY_UPDATE,
  IpcEvents.INVENTORY_ATTACH_FILE,
  IpcEvents.INVENTORY_DETACH_FILE,
  IpcEvents.INVENTORY_FROM_COMPONENT,


  IpcEvents.COMPONENT_CREATE,
  IpcEvents.COMPONENT_DELETE,
  IpcEvents.COMPONENT_GET,
  IpcEvents.COMPONENT_GET_ALL,
  IpcEvents.COMPONENT_DETACH_LICENSE,
  IpcEvents.COMPONENT_ATTACH_LICENSE,
  IpcEvents.COMPONENT_GET_FILES,
  IpcEvents.COMPONENT_GROUP_GET_ALL,
  IpcEvents.COMPONENT_GROUP_GET,

  IpcEvents.LICENSE_CREATE,
  IpcEvents.LICENSE_GET,
  IpcEvents.LICENSE_GET_ALL,
  IpcEvents.LICENSE_UPDATE,
  IpcEvents.LICENSE_DELETE,

  IpcEvents.FILE_GET_CONTENT,
  IpcEvents.FILE_GET,
  IpcEvents.IGNORED_FILES,
  IpcEvents.UNIGNORED_FILES,

  IpcEvents.RESULTS_GET,
  IpcEvents.RESULTS_GET_NO_MATCH,
  IpcEvents.RESULTS_ADD_FILTERED_FILE,
  IpcEvents. RESULTS_FORCE_ATTACH,

  IpcEvents.EXPORT,
  IpcEvents.EXPORT_NOTARIZE_SBOM,

  IpcEvents.REPORT_INVENTORY_PROGRESS,
  IpcEvents.REPORT_SUMMARY,
  IpcEvents.REPORT_DETECTED,
  IpcEvents.REPORT_IDENTIFIED,

  IpcEvents.UTILS_GET_PROJECT_DTO,
  IpcEvents.UTILS_PROJECT_NAME,
  IpcEvents.UTILS_GET_NODE_FROM_PATH,
  IpcEvents.GET_TOKEN,

  IpcEvents.WORKSPACE_PROJECT_LIST,
  IpcEvents.WORKSPACE_DELETE_PROJECT,
];
