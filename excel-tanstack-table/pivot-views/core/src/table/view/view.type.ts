import type { z } from 'zod';

import type { IRootFilter } from '../field/filter/index';
import type { RootFilter } from '../field/filter/root-filter';
import type { Calendar, ICalendarSchema } from './calendar/index';
import type { IKanbanSchema, Kanban } from './kanban/index';
import type { ISorts } from './sort/sort.schema';
import type { Sorts } from './sort/sorts';
import type { ITreeViewSchema, TreeView } from './tree-view/index';
import type { IViewFieldOption, ViewFieldOptions } from './view-field-options';
import type { ViewFieldsOrder } from './view-fields-order.vo';
import type { ViewId } from './view-id.vo';
import type { ViewName } from './view-name.vo';
import type { IViewPinnedFields, ViewPinnedFields } from './view-pinned-fields';
import type { createViewInput_internal, viewDisplayType } from './view.schema';

export interface IView {
  id: ViewId;
  name: ViewName;
  displayType: IViewDisplayType;
  showSystemFields?: boolean;
  sorts?: Sorts;
  kanban?: Kanban;
  calendar?: Calendar;
  tree?: TreeView;
  filter?: RootFilter;
  fieldOptions: ViewFieldOptions;
  fieldsOrder?: ViewFieldsOrder;
  pinnedFields?: ViewPinnedFields;
}

export interface IQueryView {
  id: string;
  name: string;
  showSystemFields?: boolean;
  sorts?: ISorts;
  kanban?: IKanbanSchema;
  tree?: ITreeViewSchema;
  calendar?: ICalendarSchema;
  displayType: IViewDisplayType;
  filter?: IRootFilter;
  fieldOptions?: Record<string, IViewFieldOption>;
  fieldsOrder?: string[];
  pinnedFields?: IViewPinnedFields;
}
export type IViewDisplayType = z.infer<typeof viewDisplayType>;
export type ICreateViewInput_internal = z.infer<
  typeof createViewInput_internal
>;
