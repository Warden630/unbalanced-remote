import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { Api } from '~/api';
import { CleanupPlan, Node, Nodes } from '~/types';
import { getAbsolutePath } from '~/helpers/tree';
import { decorateNode } from '~/shared/tree/utils';
import { isParent } from '~/helpers/tree';

interface CleanupStore {
  source: string;
  selected: string[];
  tree: Nodes;
  plan: CleanupPlan | null;
  deleting: boolean;
  deleted: boolean;
  error: string;
  actions: {
    setSource: (source: string) => Promise<void>;
    loadBranch: (node: Node) => Promise<void>;
    toggleSelected: (node: Node) => void;
    buildPlan: () => Promise<void>;
    deleteSelected: () => Promise<void>;
    resetResult: () => void;
  };
}

const rootNode = {
  id: 'root',
  label: '/',
  leaf: false,
  dir: false,
  parent: '',
};

const loaderNode = {
  id: 'loader',
  label: 'loading ...',
  leaf: false,
  dir: false,
  parent: 'root',
};

const storageRoute = (path: string) => {
  if (path.startsWith('/mnt/')) {
    return path.slice('/mnt/'.length);
  }
  return path.replace(/^\/+/, '');
};

export const useCleanupStore = create<CleanupStore>()(
  immer((set, get) => ({
    source: '',
    selected: [],
    tree: { root: decorateNode(rootNode as Node) },
    plan: null,
    deleting: false,
    deleted: false,
    error: '',
    actions: {
      setSource: async (source: string) => {
        const loader = decorateNode({ ...loaderNode } as Node);
        loader.loading = true;

        set((state) => {
          state.source = source;
          state.selected = [];
          state.plan = null;
          state.deleted = false;
          state.error = '';
          state.tree = {
            root: {
              ...decorateNode(rootNode as Node),
              children: ['loader'],
            },
            loader,
          };
        });

        const branch = await Api.getTree(`${storageRoute(source)}/`, 'root');
        for (const key in branch.nodes) {
          decorateNode(branch.nodes[key]);
        }

        set((state) => {
          state.tree = { ...state.tree, ...branch.nodes };
          delete state.tree.loader;
          state.tree.root.children = branch.order;
        });
      },
      loadBranch: async (node: Node) => {
        set((state) => {
          state.tree[node.id].expanded = !state.tree[node.id].expanded;
        });

        if (isParent(node.id, get().tree)) {
          set((state) => {
            state.tree = { ...state.tree };
          });
          return;
        }

        set((state) => {
          state.tree.loader = {
            id: 'loader',
            label: 'loading ...',
            leaf: false,
            dir: false,
            parent: node.id,
            children: [],
            checked: false,
            expanded: false,
            loading: true,
          };
          state.tree[node.id].children = ['loader'];
        });

        const route = `${storageRoute(get().source)}/${getAbsolutePath(
          node,
          get().tree,
        )}`;
        const branch = await Api.getTree(route, node.id);
        for (const key in branch.nodes) {
          decorateNode(branch.nodes[key]);
        }

        set((state) => {
          delete state.tree.loader;
          state.tree = { ...state.tree, ...branch.nodes };
          state.tree[node.id].children = branch.order;
        });
      },
      toggleSelected: (node: Node) => {
        set((state) => {
          state.tree[node.id].checked = !state.tree[node.id].checked;
          state.plan = null;
          state.deleted = false;

          const fullPath = getAbsolutePath(node, state.tree);
          const index = state.selected.indexOf(fullPath);
          if (index === -1) {
            state.selected.push(fullPath);
          } else {
            state.selected.splice(index, 1);
          }

          let parent = state.tree[node.parent];
          while (parent) {
            const parentFullPath = getAbsolutePath(parent, state.tree);
            const parentIndex = state.selected.indexOf(parentFullPath);
            if (parentIndex !== -1) {
              state.selected.splice(parentIndex, 1);
              state.tree[parent.id].checked = false;
            }
            parent = state.tree[parent.parent];
          }

          const removeChildren = (node: Node) => {
            if (!node.children) {
              return;
            }

            node.children.forEach((childId) => {
              const child = state.tree[childId];
              const childFullPath = getAbsolutePath(child, state.tree);
              const childIndex = state.selected.indexOf(childFullPath);
              if (childIndex !== -1) {
                state.selected.splice(childIndex, 1);
                state.tree[child.id].checked = false;
              }
              removeChildren(child);
            });
          };
          removeChildren(node);
        });
      },
      buildPlan: async () => {
        const { source, selected } = get();
        set((state) => {
          state.error = '';
          state.deleted = false;
        });
        try {
          const plan = await Api.cleanupPlan(source, selected);
          set((state) => {
            state.plan = plan;
          });
        } catch (e) {
          set((state) => {
            state.error = e instanceof Error ? e.message : 'Plan failed';
          });
          throw e;
        }
      },
      deleteSelected: async () => {
        const { source, selected } = get();
        set((state) => {
          state.deleting = true;
          state.error = '';
        });
        try {
          const plan = await Api.cleanupDelete(source, selected);
          set((state) => {
            state.plan = plan;
            state.selected = [];
            state.deleted = true;
          });
        } catch (e) {
          set((state) => {
            state.error = e instanceof Error ? e.message : 'Delete failed';
          });
        } finally {
          set((state) => {
            state.deleting = false;
          });
        }
      },
      resetResult: () => {
        set((state) => {
          state.plan = null;
          state.deleted = false;
          state.error = '';
        });
      },
    },
  })),
);

export const useCleanupActions = () =>
  useCleanupStore((state) => state.actions);
export const useCleanupSource = () => useCleanupStore((state) => state.source);
export const useCleanupSelected = () =>
  useCleanupStore((state) => state.selected);
export const useCleanupTree = () => useCleanupStore((state) => state.tree);
export const useCleanupPlan = () => useCleanupStore((state) => state.plan);
export const useCleanupDeleting = () =>
  useCleanupStore((state) => state.deleting);
export const useCleanupDeleted = () => useCleanupStore((state) => state.deleted);
export const useCleanupError = () => useCleanupStore((state) => state.error);
