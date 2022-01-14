import {
  LOAD_SCAN_FAIL,
  LOAD_SCAN_SUCCESS,
  RESET,
  SET_COMPONENTS,
  SET_COMPONENT,
  SET_VERSION,
  SET_FILE,
  SET_PROGRESS,
  SET_HISTORY,
  UPDATE_FILETREE,
  SET_FOLDER,
  SET_NODE,
  SET_RECENT_USED_COMPONENTS,
} from './actions';
import { Component, ComponentGroup, Node } from '../../../api/types';

const MAX_RECENT_USED_COMPONENTS = 3;

export interface State {
  name: string;
  loaded: boolean;
  progress: number;
  summary: any;
  tree: any;
  file: string | null;
  mainComponents: ComponentGroup[];
  recentUsedComponents: ComponentGroup[];
  components: ComponentGroup[];
  component: ComponentGroup;
  history: {
    report: 'detected' | 'identified';
    section: number;
  };
  filter: {
    version: string;
    node?: Node;
    folder?: string;
  };
}

export const initialState: State = {
  name: null,
  loaded: false,
  progress: 0,
  summary: null,
  tree: null,
  file: null,
  mainComponents: null,
  recentUsedComponents: null,
  components: null,
  component: null,
  history: {
    report: 'detected',
    section: null,
  },
  filter: {
    version: null,
    node: null,
  },
};

export default function reducer(state: State = initialState, action): State {
  switch (action.type) {
    case LOAD_SCAN_SUCCESS: {
      const { name, tree, components } = action;
      return {
        ...state,
        name,
        loaded: true,
        tree,
        mainComponents: components,
        components,
      };
    }
    case LOAD_SCAN_FAIL: {
      return {
        ...state,
        loaded: false,
      };
    }
    case UPDATE_FILETREE: {
      const { node } = action;
      return {
        ...state,
        tree: node, // TODO: update node tree
      };
    }
    case SET_PROGRESS: {
      const { summary } = action;
      const progress =
        summary?.detectedFiles === 0
          ? 100
          : ((summary?.identifiedFiles + summary?.ignoredFiles) * 100) / summary?.detectedFiles;
      return {
        ...state,
        summary,
        progress,
      };
    }
    case SET_COMPONENTS: {
      const { components } = action;
      return {
        ...state,
        mainComponents: components,
        components,
      };
    }
    case SET_COMPONENT: {
      const { component } = action;
      return {
        ...state,
        component,
        history: {
          ...state.history,
          section: null,
        },
        filter: {
          ...state.filter,
          version: null,
        },
      };
    }
    case SET_VERSION: {
      const { version } = action;
      return {
        ...state,
        filter: {
          ...state.filter,
          version,
        },
      };
    }
    case SET_HISTORY: {
      const { crumb } = action;
      return {
        ...state,
        history: {
          ...state.history,
          ...crumb,
        },
      };
    }
    case SET_NODE: {
      const { node } = action;
      return {
        ...state,
        filter: {
          ...state.filter,
          node,
          folder: node?.type === 'folder' ? node.path : null,
        },
      };
    }
    case SET_FILE: {
      const { file } = action;

      return {
        ...state,
        filter: {
          ...state.filter,
          node: {
            type: 'file',
            path: file,
          },
        },
      };
    }
    case SET_FOLDER: {
      const { node } = action;
      return {
        ...state,
        // components: node ? filter(state.mainComponents, node.components) : state.mainComponents,
        filter: {
          ...state.filter,
          node: node
            ? {
                type: 'folder',
                path: node.path,
              }
            : null,
        },
      };
    }
    case SET_RECENT_USED_COMPONENTS: {
      const { component } = action;
      if (state.recentUsedComponents) {
        if (!state.recentUsedComponents.some((el) => el.purl === component.purl)) {
          state.recentUsedComponents.splice(0, 0, component);
        } else {
          const index = state.recentUsedComponents.findIndex((el) => el.purl === component.purl);
          state.recentUsedComponents.splice(0, 0, component);
          state.recentUsedComponents.splice(index, 1);
        }
      } else state.recentUsedComponents = [component];

      if (state.recentUsedComponents && state.recentUsedComponents.length >= MAX_RECENT_USED_COMPONENTS)
        state.recentUsedComponents.splice(3, 1);

      return {
        ...state,
      };
    }

    case RESET:
      return { ...initialState };
    default:
      return state;
  }
}

const filter = (components, node) => {
  const keys = new Map<string, Map<string, any>>(node.map((el) => [`${el.purl}-${el.version}`, true]));

  return components.filter((el) => {
    return el.versions.some((v) => keys.has(`${el.purl}-${v.version}`));
  });
};
