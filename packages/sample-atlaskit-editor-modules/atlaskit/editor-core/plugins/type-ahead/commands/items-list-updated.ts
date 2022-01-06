import type { Command } from '../../../types';
import { ACTIONS } from '../pm-plugins/actions';
import { pluginKey } from '../pm-plugins/plugin-key';
import type { TypeAheadItem } from '../types';

export const itemsListUpdated =
  (items: Array<TypeAheadItem>): Command =>
  (state, dispatch) => {
    if (dispatch) {
      dispatch(
        state.tr.setMeta(pluginKey, {
          action: ACTIONS.ITEMS_LIST_UPDATED,
          items,
        }),
      );
    }
    return true;
  };
