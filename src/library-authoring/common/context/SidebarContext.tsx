import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { useStateWithUrlSearchParam } from '../../../hooks';
import { getBlockType } from '../../../generic/key-utils';
import { useComponentPickerContext } from './ComponentPickerContext';
import { useLibraryContext } from './LibraryContext';

export enum SidebarBodyComponentId {
  AddContent = 'add-content',
  Info = 'info',
  ComponentInfo = 'component-info',
  CollectionInfo = 'collection-info',
  UnitInfo = 'unit-info',
  SectionInfo = 'section-info',
  SubsectionInfo = 'subsection-info',
}

export const COLLECTION_INFO_TABS = {
  Manage: 'manage',
  Details: 'details',
} as const;
export type CollectionInfoTab = typeof COLLECTION_INFO_TABS[keyof typeof COLLECTION_INFO_TABS];
export const isCollectionInfoTab = (tab: string): tab is CollectionInfoTab => (
  Object.values<string>(COLLECTION_INFO_TABS).includes(tab)
);

export const COMPONENT_INFO_TABS = {
  Preview: 'preview',
  Manage: 'manage',
  Details: 'details',
} as const;
export type ComponentInfoTab = typeof COMPONENT_INFO_TABS[keyof typeof COMPONENT_INFO_TABS];
export const isComponentInfoTab = (tab: string): tab is ComponentInfoTab => (
  Object.values<string>(COMPONENT_INFO_TABS).includes(tab)
);

export const UNIT_INFO_TABS = {
  Preview: 'preview',
  Manage: 'manage',
  Usage: 'usage',
  Settings: 'settings',
} as const;
export type UnitInfoTab = typeof UNIT_INFO_TABS[keyof typeof UNIT_INFO_TABS];
export const isUnitInfoTab = (tab: string): tab is UnitInfoTab => (
  Object.values<string>(UNIT_INFO_TABS).includes(tab)
);

type SidebarInfoTab = ComponentInfoTab | CollectionInfoTab | UnitInfoTab;
const toSidebarInfoTab = (tab: string): SidebarInfoTab | undefined => (
  isComponentInfoTab(tab) || isCollectionInfoTab(tab) || isUnitInfoTab(tab)
    ? tab : undefined
);

export interface DefaultTabs {
  component: ComponentInfoTab;
  unit: UnitInfoTab;
  collection: CollectionInfoTab;
}

export interface SidebarComponentInfo {
  type: SidebarBodyComponentId;
  id: string;
}

export enum SidebarActions {
  JumpToManageCollections = 'jump-to-manage-collections',
  JumpToManageTags = 'jump-to-manage-tags',
  ManageTeam = 'manage-team',
  None = '',
}

export type SidebarContextData = {
  closeLibrarySidebar: () => void;
  openAddContentSidebar: () => void;
  openLibrarySidebar: () => void;
  openCollectionInfoSidebar: (collectionId: string) => void;
  openComponentInfoSidebar: (usageKey: string) => void;
  openUnitInfoSidebar: (usageKey: string) => void;
  sidebarComponentInfo?: SidebarComponentInfo;
  sidebarAction: SidebarActions;
  setSidebarAction: (action: SidebarActions) => void;
  resetSidebarAction: () => void;
  sidebarTab: SidebarInfoTab;
  setSidebarTab: (tab: SidebarInfoTab) => void;
  defaultTab: DefaultTabs;
  setDefaultTab: (tabs: DefaultTabs) => void;
  hiddenTabs: Array<SidebarInfoTab>;
  setHiddenTabs: (tabs: ComponentInfoTab[]) => void;
};

/**
 * Sidebar Context.
 *
 * Get this using `useSidebarContext()`
 *
 */
const SidebarContext = createContext<SidebarContextData | undefined>(undefined);

type SidebarProviderProps = {
  children?: React.ReactNode;
  /** Only used for testing */
  initialSidebarComponentInfo?: SidebarComponentInfo;
};

/**
 * React component to provide `SidebarContext`
 */
export const SidebarProvider = ({
  children,
  initialSidebarComponentInfo,
}: SidebarProviderProps) => {
  const [sidebarComponentInfo, setSidebarComponentInfo] = useState<SidebarComponentInfo | undefined>(
    initialSidebarComponentInfo,
  );

  const [defaultTab, setDefaultTab] = useState<DefaultTabs>({
    component: COMPONENT_INFO_TABS.Preview,
    unit: UNIT_INFO_TABS.Preview,
    collection: COLLECTION_INFO_TABS.Manage,
  });
  const [hiddenTabs, setHiddenTabs] = useState<Array<SidebarInfoTab>>([]);

  const [sidebarTab, setSidebarTab] = useStateWithUrlSearchParam<SidebarInfoTab>(
    defaultTab.component,
    'st',
    (value: string) => toSidebarInfoTab(value),
    (value: SidebarInfoTab) => value.toString(),
  );

  const [sidebarAction, setSidebarAction] = useStateWithUrlSearchParam<SidebarActions>(
    SidebarActions.None,
    'sa',
    (value: string) => Object.values(SidebarActions).find((enumValue) => value === enumValue),
    (value: SidebarActions) => value.toString(),
  );
  const resetSidebarAction = useCallback(() => {
    setSidebarAction(SidebarActions.None);
  }, [setSidebarAction]);

  const closeLibrarySidebar = useCallback(() => {
    setSidebarComponentInfo(undefined);
  }, []);
  const openAddContentSidebar = useCallback(() => {
    setSidebarComponentInfo({ id: '', type: SidebarBodyComponentId.AddContent });
  }, []);
  const openLibrarySidebar = useCallback(() => {
    setSidebarComponentInfo({ id: '', type: SidebarBodyComponentId.Info });
  }, []);

  const openComponentInfoSidebar = useCallback((usageKey: string) => {
    setSidebarComponentInfo({
      id: usageKey,
      type: SidebarBodyComponentId.ComponentInfo,
    });
  }, []);

  const openCollectionInfoSidebar = useCallback((newCollectionId: string) => {
    setSidebarComponentInfo({
      id: newCollectionId,
      type: SidebarBodyComponentId.CollectionInfo,
    });
  }, []);

  const openUnitInfoSidebar = useCallback((usageKey: string) => {
    setSidebarComponentInfo({
      id: usageKey,
      type: SidebarBodyComponentId.UnitInfo,
    });
  }, []);

  // Set the initial sidebar state based on the URL parameters and context.
  const { selectedItemId } = useParams();
  const { unitId, collectionId } = useLibraryContext();
  const { componentPickerMode } = useComponentPickerContext();

  useEffect(() => {
    if (initialSidebarComponentInfo) {
      // If the sidebar is already open with a selected item, we don't need to do anything.
      return;
    }
    if (componentPickerMode) {
      // If we are in component picker mode, we should not open the sidebar automatically.
      return;
    }

    // Handle selected item id changes
    if (selectedItemId) {
      let containerType: undefined | string;
      try {
        containerType = getBlockType(selectedItemId);
      } catch {
        // ignore
      }
      if (containerType === 'unit') {
        openUnitInfoSidebar(selectedItemId);
      } else if (containerType === 'section') {
        // istanbul ignore next
        // Open section info sidebar
      } else if (containerType === 'subsection') {
        // istanbul ignore next
        // Open subsection info sidebar
      } else if (selectedItemId.startsWith('lb:')) {
        openComponentInfoSidebar(selectedItemId);
      } else {
        openCollectionInfoSidebar(selectedItemId);
      }
    } else if (collectionId) {
      openCollectionInfoSidebar(collectionId);
    } else if (unitId) {
      openUnitInfoSidebar(unitId);
    } else {
      openLibrarySidebar();
    }
  }, [selectedItemId]);

  const context = useMemo<SidebarContextData>(() => {
    const contextValue = {
      closeLibrarySidebar,
      openAddContentSidebar,
      openLibrarySidebar,
      openComponentInfoSidebar,
      sidebarComponentInfo,
      openCollectionInfoSidebar,
      openUnitInfoSidebar,
      sidebarAction,
      setSidebarAction,
      resetSidebarAction,
      sidebarTab,
      setSidebarTab,
      defaultTab,
      setDefaultTab,
      hiddenTabs,
      setHiddenTabs,
    };

    return contextValue;
  }, [
    closeLibrarySidebar,
    openAddContentSidebar,
    openLibrarySidebar,
    openComponentInfoSidebar,
    sidebarComponentInfo,
    openCollectionInfoSidebar,
    openUnitInfoSidebar,
    sidebarAction,
    setSidebarAction,
    resetSidebarAction,
    sidebarTab,
    setSidebarTab,
    defaultTab,
    setDefaultTab,
    hiddenTabs,
    setHiddenTabs,
  ]);

  return (
    <SidebarContext.Provider value={context}>
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebarContext(): SidebarContextData {
  const ctx = useContext(SidebarContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    return {
      closeLibrarySidebar: () => {},
      openAddContentSidebar: () => {},
      openLibrarySidebar: () => {},
      openComponentInfoSidebar: () => {},
      openCollectionInfoSidebar: () => {},
      openUnitInfoSidebar: () => {},
      sidebarAction: SidebarActions.None,
      setSidebarAction: () => {},
      resetSidebarAction: () => {},
      sidebarTab: COMPONENT_INFO_TABS.Preview,
      setSidebarTab: () => {},
      sidebarComponentInfo: undefined,
      defaultTab: {
        component: COMPONENT_INFO_TABS.Preview,
        unit: UNIT_INFO_TABS.Preview,
        collection: COLLECTION_INFO_TABS.Manage,
      },
      setDefaultTab: () => {},
      hiddenTabs: [],
      setHiddenTabs: () => {},
    };
  }
  return ctx;
}
