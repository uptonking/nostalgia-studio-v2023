import { getExtension, getMimeType } from './attachment-field-value.util';
import { type IAttachmentFieldValue } from './attachment-field.type';
import { FieldValueBase } from './field-value.base';
import { type IFieldValueVisitor } from './field-value.visitor';

export class AttachmentFieldValue extends FieldValueBase<IAttachmentFieldValue> {
  constructor(value: IAttachmentFieldValue) {
    super(value);
  }

  unpack() {
    return this.props;
  }

  accept(visitor: IFieldValueVisitor): void {
    visitor.attachment(this);
  }

  public hasFileType(type: string): boolean {
    return this.props.some((attachment) => getMimeType(attachment) === type);
  }

  public isEmpty(): boolean {
    return !this.props.length;
  }

  public hasExtension(extension: string): boolean {
    return this.props.some(
      (attachment) => getExtension(attachment.mimeType) === extension,
    );
  }
}
