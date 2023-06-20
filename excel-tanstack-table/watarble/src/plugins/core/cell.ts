import {
  type AddColumnsRowsCommand,
  type Cell,
  type CellData,
  type CommandResult,
  type CoreCommand,
  type Format,
  type FormulaCell,
  type HeaderIndex,
  type LiteralCell,
  type Style,
  type UID,
  type UpdateCellData,
  type WorkbookData,
  type Zone,
} from '../../types';
import { CommandResults } from '../../utils/command';
import { range, toCartesian } from '../../utils/coordinates';
import { CorePlugin } from '../plugin-core';

interface CellPluginState {
  /** `{  sheetId: { cellId: cell/undefined }  }` */
  cells: Record<UID, Record<UID, Cell | undefined>>;
  nextId: number;
}

/**
 * cell contents: data + styles
 */
export class CellPlugin
  extends CorePlugin<CellPluginState>
  implements CellPluginState
{
  static getters = [
    'getCells',
    'getCellById',
    // "zoneToXC",
    // "getCellStyle",
  ] as const;

  readonly nextId = 1;
  readonly cells: { [sheetId: string]: { [id: string]: Cell } } = {};

  allowDispatch(cmd: CoreCommand): CommandResult {
    switch (cmd.type) {
      // case "UPDATE_CELL":
      // case "CLEAR_CELL":
      //   return this.checkCellOutOfSheet(cmd.sheetId, cmd.col, cmd.row);
      default:
        return CommandResults.Success;
    }
  }

  handle(cmd: CoreCommand) {
    switch (cmd.type) {
      case 'ADD_COLUMNS_ROWS':
        if (cmd.dimension === 'COL') {
          this.handleAddColumnsRows(cmd, this.copyColumnStyle.bind(this));
        } else {
          this.handleAddColumnsRows(cmd, this.copyRowStyle.bind(this));
        }
        break;
      case 'UPDATE_CELL':
        this.updateCell(cmd.sheetId, cmd.col, cmd.row, cmd);
        break;

      case 'CLEAR_CELL':
        this.dispatch('UPDATE_CELL', {
          sheetId: cmd.sheetId,
          col: cmd.col,
          row: cmd.row,
          content: '',
          style: null,
          format: '',
        });
        break;
    }
  }

  /**
   * Copy the style of the reference column/row to the new columns/rows.
   */
  private handleAddColumnsRows(
    cmd: AddColumnsRowsCommand,
    fn: (sheetId: UID, styleRef: HeaderIndex, elements: HeaderIndex[]) => void,
  ) {
    // The new elements have already been inserted in the sheet at this point.
    let insertedElements: HeaderIndex[];
    let styleReference: HeaderIndex;
    if (cmd.position === 'before') {
      insertedElements = range(cmd.base, cmd.base + cmd.quantity);
      styleReference = cmd.base + cmd.quantity;
    } else {
      insertedElements = range(cmd.base + 1, cmd.base + cmd.quantity + 1);
      styleReference = cmd.base;
    }
    fn(cmd.sheetId, styleReference, insertedElements);
  }

  import(data: WorkbookData) {
    for (const sheet of data.sheets) {
      // eslint-disable-next-line guard-for-in
      for (const xc in sheet.cells) {
        const cellData = sheet.cells[xc];
        const { col, row } = toCartesian(xc);
        if (cellData?.content || cellData?.format || cellData?.style) {
          const cell = this.importCell(
            sheet.id,
            cellData,
            data.styles,
            data.formats,
          );
          this.history.update('cells', sheet.id, cell.id, cell);
          this.dispatch('UPDATE_CELL_POSITION', {
            cellId: cell.id,
            col,
            row,
            sheetId: sheet.id,
          });
        }
      }
    }
  }

  export(data: WorkbookData) {
    const styles: { [styleId: number]: Style } = {};
    const formats: { [formatId: number]: string } = {};

    // for (let _sheet of data.sheets) {
    //   const cells: { [key: string]: CellData } = {};
    //   const positions = Object.keys(this.cells[_sheet.id] || {})
    //     .map((cellId) => this.getters.getCellPosition(cellId))
    //     .sort((a, b) => (a.col === b.col ? a.row - b.row : a.col - b.col));
    //   for (const position of positions) {
    //     const cell = this.getters.getCell(position)!;
    //     const xc = toXC(position.col, position.row);

    //     cells[xc] = {
    //       style: cell.style ? getItemId<Style>(cell.style, styles) : undefined,
    //       format: cell.format ? getItemId<Format>(cell.format, formats) : undefined,
    //       content: cell.content || undefined,
    //     };
    //   }
    //   _sheet.cells = cells;
    // }
    data.styles = styles;
    data.formats = formats;
  }

  importCell(
    sheetId: UID,
    cellData: CellData,
    normalizedStyles: { [key: number]: Style },
    normalizedFormats: { [key: number]: Format },
  ): Cell {
    const style =
      (cellData.style && normalizedStyles[cellData.style]) || undefined;
    const format =
      (cellData.format && normalizedFormats[cellData.format]) || undefined;
    const cellId = this.getNextUid();
    return this.createCell(
      cellId,
      cellData?.content || '',
      format,
      style,
      sheetId,
    );
  }

  getCells(sheetId: UID): Record<UID, Cell> {
    return this.cells[sheetId] || {};
  }

  getCellById(cellId: UID): Cell | undefined {
    // this must be as fast as possible
    // eslint-disable-next-line guard-for-in
    for (const sheetId in this.cells) {
      const sheet = this.cells[sheetId];
      const cell = sheet[cellId];
      if (cell) {
        return cell;
      }
    }
    return undefined;
  }

  // getCellStyle(position: CellPosition): Style {
  //   return this.getters.getCell(position)?.style || {};
  // }

  private setStyle(sheetId: UID, target: Zone[], style: Style | undefined) {
    for (const zone of target) {
      for (let col = zone.left; col <= zone.right; col++) {
        for (let row = zone.top; row <= zone.bottom; row++) {
          const cell = this.getters.getCell({ sheetId, col, row });
          this.dispatch('UPDATE_CELL', {
            sheetId,
            col,
            row,
            style: style ? { ...cell?.style, ...style } : undefined,
          });
        }
      }
    }
  }

  /**
   * Copy the style of one column to other columns.
   */
  private copyColumnStyle(
    sheetId: UID,
    refColumn: HeaderIndex,
    targetCols: HeaderIndex[],
  ) {
    // for (let row = 0; row < this.getters.getNumberRows(sheetId); row++) {
    //   const format = this.getFormat(sheetId, refColumn, row);
    //   if (format.style || format.format) {
    //     for (const col of targetCols) {
    //       this.dispatch('UPDATE_CELL', { sheetId, col, row, ...format });
    //     }
    //   }
    // }
  }

  /**
   * Copy the style of one row to other rows.
   */
  private copyRowStyle(
    sheetId: UID,
    refRow: HeaderIndex,
    targetRows: HeaderIndex[],
  ) {
    // for (let col = 0; col < this.getters.getNumberCols(sheetId); col++) {
    //   const format = this.getFormat(sheetId, col, refRow);
    //   if (format.style || format.format) {
    //     for (const row of targetRows) {
    //       this.dispatch('UPDATE_CELL', { sheetId, col, row, ...format });
    //     }
    //   }
    // }
  }

  /**
   * gets the currently used style/border of a cell based on it's coordinates
   */
  private getFormat(
    sheetId: UID,
    col: HeaderIndex,
    row: HeaderIndex,
  ): { style?: Style; format?: Format } {
    const format: { style?: Style; format?: string } = {};
    // const position = this.getters.getMainCellPosition({ sheetId, col, row });
    // const cell = this.getters.getCell(position);
    // if (cell) {
    //   if (cell.style) {
    //     format["style"] = cell.style;
    //   }
    //   if (cell.format) {
    //     format["format"] = cell.format;
    //   }
    // }
    return format;
  }

  private getNextUid() {
    const id = this.nextId.toString();
    this.history.update('nextId', this.nextId + 1);
    return id;
  }

  private updateCell(
    sheetId: UID,
    col: HeaderIndex,
    row: HeaderIndex,
    after: UpdateCellData,
  ) {
    const before = this.getters.getCell({ sheetId, col, row });
    const hasContent = 'content' in after || 'formula' in after;

    // Compute the new cell properties
    // const afterContent = hasContent ? replaceSpecialSpaces(after?.content) : before?.content || "";
    const afterContent = hasContent ? after?.content : before?.content || '';
    let style: Style | undefined;
    if (after.style !== undefined) {
      style = after.style || undefined;
    } else {
      style = before ? before.style : undefined;
    }
    const format = undefined;
    // ("format" in after ? after.format : before && before.format) || detectFormat(afterContent);

    const cellId = before?.id || this.getNextUid();
    const cell = this.createCell(cellId, afterContent, format, style, sheetId);
    this.history.update('cells', sheetId, cell.id, cell);
    this.dispatch('UPDATE_CELL_POSITION', {
      cellId: cell.id,
      col,
      row,
      sheetId,
    });
  }

  private createCell(
    id: UID,
    content: string,
    format: Format | undefined,
    style: Style | undefined,
    sheetId: UID,
  ): Cell {
    if (!content.startsWith('=')) {
      return this.createLiteralCell(id, content, format, style);
    }
    try {
      return this.createFormulaCell(id, content, format, style, sheetId);
    } catch (error) {
      return this.createErrorFormula(id, content, format, style, error);
    }
  }

  private createLiteralCell(
    id: UID,
    content: string,
    format: Format | undefined,
    style: Style | undefined,
  ): LiteralCell {
    return {
      id,
      content,
      style,
      format,
      isFormula: false,
    };
  }

  private createFormulaCell(
    id: UID,
    content: string,
    format: Format | undefined,
    style: Style | undefined,
    sheetId: UID,
  ): FormulaCell {
    // const compiledFormula = compile(content);
    // if (compiledFormula.dependencies.length) {
    //   return this.createFormulaCellWithDependencies(id, compiledFormula, format, style, sheetId);
    // }
    return {
      id,
      content,
      style,
      format,
      isFormula: true,
      // compiledFormula,
      dependencies: [],
    };
  }

  private createErrorFormula(
    id: UID,
    content: string,
    format: Format | undefined,
    style: Style | undefined,
    error: unknown,
  ): FormulaCell {
    return {
      id,
      content,
      style,
      format,
      isFormula: true,
      // compiledFormula: {
      //   dependencies: [],
      //   tokens: tokenize(content),
      //   execute: function () {
      //     throw error;
      //   },
      // },
      dependencies: [],
    };
  }

  private checkCellOutOfSheet(
    sheetId: UID,
    col: HeaderIndex,
    row: HeaderIndex,
  ): CommandResult {
    const sheet = this.getters.getSheet(sheetId);
    if (!sheet) return CommandResults.InvalidSheetId;
    // const sheetZone = this.getters.getSheetZone(sheetId);
    // return isInside(col, row, sheetZone) ? CommandResult.Success : CommandResult.TargetOutOfSheet;
    return CommandResults.Success;
  }
}
