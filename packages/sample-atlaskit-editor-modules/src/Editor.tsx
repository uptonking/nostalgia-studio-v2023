import { EditorView } from 'prosemirror-view';
import React, { useEffect, useMemo, useState } from 'react';

import { EditorActions } from './EditorActions';
import { EditorContext } from './EditorContext';
import { ReactEditorView } from './ReactEditorView';
import { FullPage } from './editor-appearance/FullPage/FullPage';
import { QuickInsertOptions } from './plugins/quick-insert/types';
import { ProviderFactory } from './provider-factory/ProviderFactory';
import { quickInsertProviderFactory } from './provider-factory/quick-insert-provider';
import { PortalProvider, PortalRenderer } from './react-portals';
import { EditorAppearance } from './types/editor-ui';
import { EventDispatcher } from './utils/event-dispatcher';

/** subset of AtlassianEditorProps */
export interface EditorProps {
  /*
  Configure the display mode of the editor. Different modes may have different feature sets supported.
  - `full-page` - should be used for a full page editor where it is the user focus of the page
  - `comment` - should be used for things like comments where you have a field input but require a toolbar & save/cancel buttons
  - `chromeless` - is essentially the `comment` editor but without the editor chrome, like toolbar & save/cancel buttons
  - `mobile` - should be used for the mobile web view. It is a full page editor version for mobile.
  */
  appearance?: EditorAppearance;
  // Set to enable the quick insert menu i.e. '/' key trigger.
  // You can also provide your own insert menu options that will be shown in addition to the enabled
  // editor features e.g. Confluence uses this to provide its macros.
  quickInsert?: QuickInsertOptions;
  // Set if the editor should be focused.
  shouldFocus?: boolean;
  /**
   * @description Control performance metric measurements and tracking
   */
  performanceTracking?: boolean;
}

// An interesting feature whose purpose I'm not completely sure what is
// https://bitbucket.org/atlassian/atlassian-frontend-mirror/src/master/editor/editor-common/src/extensions/
// extensionProvider: any

const components = {
  'full-page': FullPage,
};

/** 基于react的编辑器组件，可定制不同外观布局如FullPage/Comment */
export function Editor(props: EditorProps) {
  const { appearance = 'full-page' } = props;

  // 作为EditorContext的value，提供了编辑器更新方法，注意没有提供setState更新方法
  const [editorActions] = useState<EditorActions>(new EditorActions());
  // provider管理器，也是一个事件管理器，注意没有提供setState更新方法
  const [providerFactory] = useState<ProviderFactory>(new ProviderFactory());
  // 提供预定义slash菜单项的工厂方法
  const [quickInsertProvider] = useState(
    Promise.resolve(quickInsertProviderFactory()),
  );

  /** 包含了布局装饰等的编辑器组件，默认使用 FullPage */
  const EditorWithLayoutComp = useMemo(
    () => components[appearance],
    [appearance],
  );

  useEffect(() => {
    function handleProviders() {
      if (quickInsertProvider) {
        providerFactory.setProvider('quickInsertProvider', quickInsertProvider);
      }
    }

    // 更新providers，此时cb为空没有可执行的
    handleProviders();
  }, [providerFactory, quickInsertProvider]);

  /** 会在EditorView创建时执行，cb默认为空数组 */
  function onEditorCreated(instance: {
    view: EditorView;
    eventDispatcher: EventDispatcher;
    // transformer?: Transformer<string>;
  }) {
    editorActions._privateRegisterEditor(
      instance.view,
      instance.eventDispatcher,
    );
  }

  function onEditorDestroyed(_instance: {
    view: EditorView;
    transformer?: Transformer<string>;
  }) {
    editorActions._privateUnregisterEditor();
  }

  return (
    <EditorContext editorActions={editorActions}>
      <PortalProvider
        render={(portalProviderAPI) => (
          <React.Fragment>
            <ReactEditorView
              editorProps={props}
              providerFactory={providerFactory}
              portalProviderAPI={portalProviderAPI}
              onEditorCreated={onEditorCreated}
              onEditorDestroyed={onEditorDestroyed}
              render={({ editor, view, eventDispatcher, config }) => (
                <EditorWithLayoutComp
                  appearance={appearance}
                  editorActions={editorActions}
                  editorDOMElement={editor}
                  editorView={view}
                  providerFactory={providerFactory}
                  eventDispatcher={eventDispatcher}
                  contentComponents={config.contentComponents}
                  primaryToolbarComponents={config.primaryToolbarComponents}
                />
              )}
            />
            <PortalRenderer portalProviderAPI={portalProviderAPI} />
          </React.Fragment>
        )}
      />
    </EditorContext>
  );
}
