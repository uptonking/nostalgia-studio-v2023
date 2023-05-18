import { createTestRecord } from '../fixtures/index';
import { Record } from '../record';
import { WithRecordId } from './record-id.specification';

describe('WithRecordId', () => {
  test('#isSatisfiedBy', () => {
    const spec = WithRecordId.fromString('record');
    const is = spec.isSatisfiedBy(createTestRecord());
    expect(is).toBeTruthy();
  });

  test('#mutate', () => {
    const id = 'testint';
    const spec = WithRecordId.fromString(id);
    const record = Record.empty();
    spec.mutate(record);

    expect(record.id.value).toBe(id);
  });
});
