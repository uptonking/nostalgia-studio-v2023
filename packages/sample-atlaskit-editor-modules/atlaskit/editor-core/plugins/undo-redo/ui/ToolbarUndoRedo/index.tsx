import { EditorView } from 'prosemirror-view';
import React, { PureComponent } from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';

import RedoIcon from '@atlaskit/icon/glyph/redo';
import UndoIcon from '@atlaskit/icon/glyph/undo';

import {
  ToolTipContent,
  redo as redoKeymap,
  undo as undoKeymap,
} from '../../../../keymaps';
import ToolbarButton, { TOOLBAR_BUTTON } from '../../../../ui/ToolbarButton';
import { ButtonGroup, Separator } from '../../../../ui/styles';
import { HistoryPluginState } from '../../../history/types';
import { redoFromToolbar, undoFromToolbar } from '../../commands';
import { messages } from '../../messages';

export interface Props {
  undoDisabled?: boolean;
  redoDisabled?: boolean;
  disabled?: boolean;
  isReducedSpacing?: boolean;
  historyState: HistoryPluginState;
  editorView: EditorView;
}

export class ToolbarUndoRedo extends PureComponent<Props & InjectedIntlProps> {
  render() {
    const {
      disabled,
      isReducedSpacing,
      historyState,
      editorView,
      intl: { formatMessage },
    } = this.props;

    const handleUndo = () => {
      undoFromToolbar(editorView.state, editorView.dispatch);
    };
    const handleRedo = () => {
      redoFromToolbar(editorView.state, editorView.dispatch);
    };

    const labelUndo = formatMessage(messages.undo);
    const labelRedo = formatMessage(messages.redo);

    const { canUndo, canRedo } = historyState;

    return (
      <ButtonGroup width={isReducedSpacing ? 'small' : 'large'}>
        <ToolbarButton
          buttonId={TOOLBAR_BUTTON.UNDO}
          spacing={isReducedSpacing ? 'none' : 'default'}
          onClick={handleUndo}
          disabled={!canUndo || disabled}
          title={<ToolTipContent description={labelUndo} keymap={undoKeymap} />}
          iconBefore={<UndoIcon label={labelUndo} />}
          testId='ak-editor-toolbar-button-undo'
        />
        <ToolbarButton
          spacing={isReducedSpacing ? 'none' : 'default'}
          buttonId={TOOLBAR_BUTTON.REDO}
          onClick={handleRedo}
          disabled={!canRedo || disabled}
          title={<ToolTipContent description={labelRedo} keymap={redoKeymap} />}
          iconBefore={<RedoIcon label={labelRedo} />}
          testId='ak-editor-toolbar-button-redo'
        />
        <Separator />
      </ButtonGroup>
    );
  }
}

export default injectIntl(ToolbarUndoRedo);
