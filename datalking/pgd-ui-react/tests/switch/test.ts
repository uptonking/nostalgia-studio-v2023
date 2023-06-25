import { click, getByLabelText, getByRole, press } from '@ariakit/test';

test('markup', () => {
  expect(document.body).toMatchInlineSnapshot(`
    <body>
      <div>
        <label
          class="label"
        >
          <input
            aria-checked="false"
            class="checkbox"
            data-command=""
            role="switch"
            type="checkbox"
          />
           wifi status
        </label>
      </div>
    </body>
  `);
});

test('toggle switch on click', async () => {
  expect(getByRole('switch')).not.toBeChecked();
  await click(getByLabelText('wifi status'));
  expect(getByRole('switch')).toBeChecked();
});

test('tab', async () => {
  expect(getByRole('switch')).not.toHaveFocus();
  await press.Tab();
  expect(getByRole('switch')).toHaveFocus();
});

// enter key is optional
test('space', async () => {
  await press.Tab();
  expect(getByRole('switch')).toHaveFocus();
  expect(getByRole('switch')).not.toBeChecked();
  await press.Space();
  expect(getByRole('switch')).toBeChecked();
  await press.Space();
  expect(getByRole('switch')).not.toBeChecked();
});
