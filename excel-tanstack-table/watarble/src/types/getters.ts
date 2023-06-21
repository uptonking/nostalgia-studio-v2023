import {
  type BorderPlugin,
  type CellPlugin,
  type EditSessionPlugin,
  type SheetPlugin,
  type SortPlugin,
  type TablePlugin,
} from '../plugins';

type GetterNames<Plugin extends { getters: readonly string[] }> =
  Plugin['getters'][number];

type SheetGetters = Pick<SheetPlugin, GetterNames<typeof SheetPlugin>>;
type CellGetters = Pick<CellPlugin, GetterNames<typeof CellPlugin>>;
type BorderGetters = Pick<BorderPlugin, GetterNames<typeof BorderPlugin>>;

// type SelectionGetters = Pick<GridSelectionPlugin, GetterNames<typeof GridSelectionPlugin>>;
type SortGetters = Pick<SortPlugin, GetterNames<typeof SortPlugin>>;
type TableGetters = Pick<TablePlugin, GetterNames<typeof TablePlugin>>;
type EditSessionGetters = Pick<
  EditSessionPlugin,
  GetterNames<typeof EditSessionPlugin>
>;

export type CoreGetters = SheetGetters & CellGetters & BorderGetters;

export type Getters = CoreGetters &
  TableGetters &
  SortGetters &
  EditSessionGetters;
