import { EditorView } from 'prosemirror-view';
import React, { ReactElement } from 'react';

import {
  ProviderFactory,
  WidthConsumer,
  useWidthContext,
} from '../../../../editor-common';
import EditorActions from '../../../actions';
import { EventDispatcher } from '../../../event-dispatcher';
import type { DispatchAnalyticsEvent } from '../../../plugins/analytics';
import type {
  EditorAppearance,
  ReactComponents,
  UIComponentFactory,
} from '../../../types';
import { ClickAreaBlock } from '../../Addon';
import ContextPanel from '../../ContextPanel';
import {
  ContextPanelConsumer,
  useContextPanelContext,
} from '../../ContextPanel/context';
import PluginSlot from '../../PluginSlot';
import WidthEmitter from '../../WidthEmitter';
import {
  ContentArea,
  EditorContentArea,
  EditorContentGutter,
  ScrollContainer,
  SidebarArea,
} from './StyledComponents';

interface FullPageEditorContentAreaProps {
  appearance: EditorAppearance | undefined;
  contextPanel: ReactComponents | undefined;
  contentArea: HTMLElement | undefined;
  /** 会现出在PluginSlot中的组件，如 */
  contentComponents: UIComponentFactory[] | undefined;
  customContentComponents: ReactComponents | undefined;
  /** prosemirror编辑器显示的区域，类型是ReactElement，属性名有点误导 */
  editorDOMElement: ReactElement;
  disabled: boolean | undefined;
  dispatchAnalyticsEvent: DispatchAnalyticsEvent | undefined;
  editorActions: EditorActions | undefined;
  editorView: EditorView;
  eventDispatcher: EventDispatcher | undefined;
  allowAnnotation: boolean | undefined;
  popupsMountPoint: HTMLElement | undefined;
  popupsBoundariesElement: HTMLElement | undefined;
  popupsScrollableElement: HTMLElement | undefined;
  providerFactory: ProviderFactory;
  scrollContainer: HTMLElement | null;
  contentAreaRef(ref: HTMLElement | null): void;
  scrollContainerRef(ref: HTMLElement | null): void;
}

export const CONTENT_AREA_TEST_ID = 'ak-editor-fp-content-area';

/**
 * 编辑器内容区设计较复杂，不同内容渲染在不同子树，最重要的部分是 EditorContentArea；
 * props.customContentComponents、PluginSlot、props.editorDOMElement是平级的。
 * 除ClickAreaBlock/PluginSlot/WidthEmitter外都是styled.div。
 */
export const FullPageContentArea: React.FunctionComponent<FullPageEditorContentAreaProps> =
  React.memo((props) => {
    // console.log(';;props4 FullPageContentArea, ', props);

    const { width } = useWidthContext();
    const { positionedOverEditor } = useContextPanelContext();

    return (
      // <WidthConsumer>
      //   {({ width }) => (
      //     <ContextPanelConsumer>
      //       {({ positionedOverEditor }) => (
      <ContentArea
        data-testid={CONTENT_AREA_TEST_ID}
        positionedOverEditor={positionedOverEditor}
      >
        <ScrollContainer<any>
          innerRef={props.scrollContainerRef}
          allowAnnotation={props.allowAnnotation}
          className='fabric-editor-popup-scroll-parent'
        >
          <ClickAreaBlock editorView={props.editorView}>
            <EditorContentArea
              fullWidthMode={props.appearance === 'full-width'}
              innerRef={props.contentAreaRef}
              containerWidth={width}
            >
              <EditorContentGutter
                className={[
                  'ak-editor-content-area',
                  props.appearance === 'full-width'
                    ? 'fabric-editor--full-width-mode'
                    : '',
                ].join(' ')}
              >
                {props.customContentComponents}
                <PluginSlot
                  editorView={props.editorView}
                  editorActions={props.editorActions}
                  eventDispatcher={props.eventDispatcher}
                  providerFactory={props.providerFactory}
                  appearance={props.appearance}
                  items={props.contentComponents}
                  contentArea={props.contentArea}
                  popupsMountPoint={props.popupsMountPoint}
                  popupsBoundariesElement={props.popupsBoundariesElement}
                  popupsScrollableElement={props.popupsScrollableElement}
                  disabled={!!props.disabled}
                  containerElement={props.scrollContainer}
                  dispatchAnalyticsEvent={props.dispatchAnalyticsEvent}
                />
                {
                  // 这里渲染核心的prosemirror-EditorView组件
                  props.editorDOMElement
                }
              </EditorContentGutter>
            </EditorContentArea>
          </ClickAreaBlock>
        </ScrollContainer>
        <SidebarArea>
          {
            // props.contextPanel 默认undefined
            props.contextPanel || <ContextPanel visible={false} />
          }
        </SidebarArea>
        <WidthEmitter editorView={props.editorView} />
      </ContentArea>
      //       )}
      //     </ContextPanelConsumer>
      //   )}
      // </WidthConsumer>
    );
  });
