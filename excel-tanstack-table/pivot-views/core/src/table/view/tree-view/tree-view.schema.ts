import { z } from 'zod';
import { TreeField } from '../../field/index';
import { fieldIdSchema } from '../../field/value-objects/field-id.schema';

export const treeViewSchema = z.object({
  fieldId: fieldIdSchema.optional(),
});

export const treeViewField = z.instanceof(TreeField);

export type ITreeViewField = z.infer<typeof treeViewField>;

export type ITreeViewSchema = z.infer<typeof treeViewSchema>;
