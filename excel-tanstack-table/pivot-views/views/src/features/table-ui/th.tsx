import React from 'react';

import { useTranslation } from 'react-i18next';

import type { Field } from '@datalking/pivot-core';
import {
  useSetFieldSortMutation,
  useSetFieldWidthMutation,
} from '@datalking/pivot-store';
import {
  ActionIcon,
  Box,
  Group,
  IconSortAscending,
  IconSortDescending,
  Text,
  Tooltip,
} from '@datalking/pivot-ui';
import styled from '@emotion/styled';

import { useCurrentTable } from '../../hooks/use-current-table';
import { useCurrentView } from '../../hooks/use-current-view';
import { FieldIcon } from '../field-inputs/field-Icon';
import { FieldIssue } from '../field/field-issue';
import { TableUIFieldMenu } from '../table/table-ui-field-menu';
import type { TColumn, THeader } from './interface';
import { usePinnedStyles } from './styles';

const ResizerLine = styled.div<{ isResizing: boolean }>`
  display: block;
  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 2px;
  background-color: #2d7ff9;
  opacity: ${(props) => (props.isResizing ? 1 : 0)};
`;

const Resizer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 3px;
  cursor: ew-resize;
  user-select: none;
  touch-action: none;

  :hover {
    .line {
      opacity: 1;
    }
  }
`;

interface IProps {
  header: THeader;
  column: TColumn;
  field: Field;
  index: number;
}

export const Th = ({ header, field, column, index }: IProps) => {
  const { t } = useTranslation();
  const table = useCurrentTable();
  const view = useCurrentView();

  const direction = view.getFieldSort(field.id.value).into();
  const [setFieldWidth] = useSetFieldWidthMutation();
  const [setFieldSort] = useSetFieldSortMutation();

  const onSetFieldWidth = (fieldId: string, width: number) => {
    setFieldWidth({
      tableId: table.id.value,
      fieldId,
      viewId: view.id.value,
      width,
    });
  };

  const pinned = header.column.getIsPinned();
  const isLastPinned =
    pinned &&
    header.column.getPinnedIndex() ===
      header.getContext().table.getLeftLeafHeaders().length - 1;

  const left = header.getStart();
  const { classes, cx } = usePinnedStyles({ left });

  return (
    <Box
      component='th'
      data-field-id={field.id.value}
      key={header.id}
      className={cx(classes.cell, {
        [classes.sticky]: pinned,
        [classes.last]: isLastPinned,
      })}
      w={header.getSize() + 'px'}
      h='38px'
      sx={{
        overflow: 'hidden',
        zIndex: pinned ? 1000 : 999,
        position: pinned ? 'sticky' : 'absolute',
        left,
      }}
    >
      <Group spacing='xs' noWrap h='100%'>
        <FieldIcon type={field.type} size={14} />
        <Text
          fz='sm'
          fw={500}
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {field.name.value}
        </Text>
      </Group>

      <Box
        sx={{
          position: 'absolute',
          right: 5,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <Group spacing='xs'>
          {direction && (
            <Tooltip
              label={
                direction === 'asc'
                  ? (t('Sort By Desending', { ns: 'common' }) as string)
                  : t('Sort By Ascending', { ns: 'common' })
              }
            >
              <ActionIcon
                variant='light'
                sx={{
                  transition: 'transform 320ms ease',
                  ':hover': {
                    transform: 'rotate(180deg)',
                  },
                }}
                onClick={() => {
                  setFieldSort({
                    tableId: table.id.value,
                    viewId: view.id.value,
                    fieldId: field.id.value,
                    direction: direction === 'asc' ? 'desc' : 'asc',
                  });
                }}
              >
                {direction === 'asc' ? (
                  <IconSortAscending size={14} />
                ) : (
                  <IconSortDescending size={14} />
                )}
              </ActionIcon>
            </Tooltip>
          )}
          {field.hasIssue && <FieldIssue field={field} />}
          <TableUIFieldMenu field={field} index={index} header={header} />
        </Group>
      </Box>

      <Resizer
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        onMouseUp={() => onSetFieldWidth(header.id, header.getSize())}
      >
        <ResizerLine className='line' isResizing={column.getIsResizing()} />
      </Resizer>
    </Box>
  );
};
