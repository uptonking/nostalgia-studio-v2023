/**
 * @description maps
 * @author wangfupeng
 */

import { type Element as SlateElement } from 'slate';
import { type IDomEditor } from '@wangeditor/core';

export const ELEM_TO_EDITOR = new WeakMap<SlateElement, IDomEditor>();
