import { ExportFormat } from "../api/types";

export interface IAppConfig {
  APP_NAME: string;

  API_URL: string;
  MIN_VERSION_SUPPORTED: string;
  DEFAULT_WORKSPACE_NAME: string;

  // feature flags
  FF_ENABLE_COMPONENT_LOGO: boolean;
  FF_ENABLE_WORKBENCH_FILTERS: boolean;
  FF_EXPORT_FORMAT_OPTIONS: Array<ExportFormat>;
  FF_ENABLE_AUTO_ACCEPT_AFTER_SCAN: boolean;
}
