import rafSchedule from 'raf-schd';
import * as React from 'react';

import { akEditorToolbarKeylineHeight } from '../../../../editor-shared-styles';
import { getFeatureFlags } from '../../../plugins/feature-flags-context';
import type { EditorAppearanceComponentProps } from '../../../types';
import { ContextPanelWidthProvider } from '../../ContextPanel/context';
import { FullPageContentArea } from './FullPageContentArea';
import { FullPageToolbar } from './FullPageToolbar';
import { FullPageEditorWrapper } from './StyledComponents';

interface FullPageEditorState {
  showKeyline: boolean;
}

/** a full page editor where it is the user focus of the page.
 * full-page编辑器的vdom结构从上到下依次是 FullPageToolbar、PluginSlot、editorDOMElement、SidebarArea。
 * 注意PortalRenderer组件的vdom与FullPageEditor的祖先父元素平级。
 */
export class FullPageEditor extends React.Component<
  EditorAppearanceComponentProps,
  FullPageEditorState
> {
  static displayName = 'FullPageEditor';

  state: FullPageEditorState = {
    showKeyline: false,
  };

  /** callback ref */
  private scrollContainer: HTMLElement | null = null;
  /** callback ref */
  private contentArea: HTMLElement | undefined;
  private scheduledKeylineUpdate: number | undefined;

  private contentAreaRef = (contentArea: HTMLElement) => {
    this.contentArea = contentArea;
  };
  private scrollContainerRef = (ref: HTMLElement | null) => {
    const previousScrollContainer = this.scrollContainer;

    // remove existing handler
    if (previousScrollContainer) {
      previousScrollContainer.removeEventListener(
        'scroll',
        this.updateToolbarKeyline,
      );
    }

    this.scrollContainer = ref ? ref : null;

    if (this.scrollContainer) {
      this.scrollContainer.addEventListener(
        'scroll',
        this.updateToolbarKeyline,
        false,
      );
      this.updateToolbarKeyline();
    }
  };

  public componentDidMount() {
    window.addEventListener('resize', this.handleResize, false);
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);

    if (this.scheduledKeylineUpdate) {
      cancelAnimationFrame(this.scheduledKeylineUpdate);
    }
  }

  /** 触发组件更新 setState({ showKeyline }) */
  private updateToolbarKeyline = rafSchedule(() => {
    if (!this.scrollContainer) {
      return false;
    }

    const { scrollTop } = this.scrollContainer;
    const showKeyline = scrollTop > akEditorToolbarKeylineHeight;
    if (showKeyline !== this.state.showKeyline) {
      this.setState({ showKeyline });
    }

    return false;
  });

  private handleResize = () => {
    this.scheduledKeylineUpdate = this.updateToolbarKeyline() as any;
  };

  public render() {
    const { props } = this;
    const { showKeyline } = this.state;
    const featureFlags = props.editorView?.state
      ? getFeatureFlags(props.editorView.state)
      : undefined;

    return (
      <ContextPanelWidthProvider>
        <FullPageEditorWrapper className='akEditor'>
          <FullPageToolbar
            appearance={props.appearance}
            beforeIcon={props.primaryToolbarIconBefore}
            collabEdit={props.collabEdit}
            containerElement={this.scrollContainer}
            customPrimaryToolbarComponents={
              props.customPrimaryToolbarComponents
            }
            disabled={!!props.disabled}
            dispatchAnalyticsEvent={props.dispatchAnalyticsEvent}
            editorActions={props.editorActions}
            editorDOMElement={props.editorDOMElement}
            editorView={props.editorView!}
            eventDispatcher={props.eventDispatcher!}
            hasMinWidth={props.enableToolbarMinWidth}
            popupsBoundariesElement={props.popupsBoundariesElement}
            popupsMountPoint={props.popupsMountPoint}
            popupsScrollableElement={props.popupsScrollableElement}
            primaryToolbarComponents={props.primaryToolbarComponents}
            providerFactory={props.providerFactory}
            showKeyline={showKeyline}
            featureFlags={featureFlags}
          />
          <FullPageContentArea
            allowAnnotation={props.allowAnnotation}
            appearance={props.appearance}
            contentArea={this.contentArea}
            contentAreaRef={this.contentAreaRef}
            contentComponents={props.contentComponents}
            contextPanel={props.contextPanel}
            customContentComponents={props.customContentComponents}
            disabled={props.disabled}
            dispatchAnalyticsEvent={props.dispatchAnalyticsEvent}
            editorActions={props.editorActions}
            editorDOMElement={props.editorDOMElement}
            editorView={props.editorView!}
            eventDispatcher={props.eventDispatcher}
            popupsBoundariesElement={props.popupsBoundariesElement}
            popupsMountPoint={props.popupsMountPoint}
            popupsScrollableElement={props.popupsScrollableElement}
            providerFactory={props.providerFactory}
            scrollContainer={this.scrollContainer}
            scrollContainerRef={this.scrollContainerRef}
          />
        </FullPageEditorWrapper>
      </ContextPanelWidthProvider>
    );
  }
}
