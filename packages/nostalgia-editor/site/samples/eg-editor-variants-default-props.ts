import debounce from 'lodash/debounce';

export const DefaultArgs = {
  storyTitle: 'DefaultEditor',
  defaultValue: `# Welcome

Just an easy to use **Markdown** editor with \`slash commands\``,
};

export const TemplateDocArgs = {
  storyTitle: 'TemplateDoc',
  template: true,
  defaultValue: `# Template

This document acts as a "template document", it's possible to insert placeholder marks that can be filled in later by others in a non-template document.

\\
!!This is a template placeholder!!`,
};

export const HeadingsArgs = {
  storyTitle: 'Headings',

  defaultValue: `# Heading 1

## Heading 2

### Heading 3

#### Heading 4`,
};

export const ListsArgs = {
  storyTitle: 'Lists',

  defaultValue: `# Lists

- An
- Unordered
- List

\\
1. An
1. Ordered
1. List`,
};

export const BlockquotesArgs = {
  storyTitle: 'Blockquotes',

  defaultValue: `# Block quotes

> Quotes are another way to callout text within a larger document
> They are often used to incorrectly attribute words to historical figures`,
};

export const TablesArgs = {
  storyTitle: 'Tables',

  defaultValue: `# Tables

Simple tables with alignment and row/col editing are supported, they can be inserted from the slash menu

| Editor      | Rank | React | Collaborative |
|-------------|------|-------|--------------:|
| Prosemirror | A    |   No  |           Yes |
| Slate       | B    |  Yes  |            No |
| CKEdit      | C    |   No  |           Yes |
`,
};
export const MarksArgs = {
  storyTitle: 'Marks',

  defaultValue: `This document shows the variety of marks available, most can be accessed through the formatting menu by selecting text or by typing out the Markdown manually.

\\
**bold**
_italic_
~~strikethrough~~
__underline__
==highlighted==
\`inline code\`
!!placeholder!!
[a link](http://www.getoutline.com)
`,
};

export const CodeArgs = {
  storyTitle: 'Code',

  defaultValue: `# Code

\`\`\`html
<html>
  <p class="content">Simple code blocks are supported</html>
</html>
\`\`\`
`,
};

export const CodeBlockOjsArgs = {
  storyTitle: 'CodeBlockOjsArgs',

  defaultValue: `# js Code

\`\`\`javascript
const a = 1123;
\`\`\`
`,
};

export const NoticesArgs = {
  storyTitle: 'Notices',

  defaultValue: `# Notices

There are three types of editable notice blocks that can be used to callout information:

\\
:::info
Informational
:::

:::tip
Tip
:::

:::warning
Warning
:::
`,
};

export const ImagesArgs = {
  storyTitle: 'Images',

  defaultValue: `# Images
![A caption](https://www.baidu.com/img/bd_logo1.png)`,
  uploadImage: (file): Promise<any> => {
    console.log('正在上传图片: ', file);

    // Delay to simulate time taken to upload
    return new Promise((resolve) => {
      setTimeout(() => resolve(URL.createObjectURL(file)), 1500);
    });
  },
};

export const ReadOnlyArgs = {
  storyTitle: 'ReadOnly',

  readOnly: true,
  defaultValue: `# Read Only

The content of this editor cannot be edited`,
};

export const MaxLengthArgs = {
  storyTitle: 'MaxLength',

  maxLength: 100,
  defaultValue: `This document has a max length of 100 characters. Once reached typing is prevented`,
};

export const CheckboxesArgs = {
  storyTitle: 'Checkboxes',

  defaultValue: `
- [x] done
- [ ] todo`,
};

export const ReadOnlyWriteCheckboxesArgs = {
  storyTitle: 'ReadOnlyWriteCheckboxes',

  readOnly: true,
  readOnlyWriteCheckboxes: true,
  defaultValue: `A read-only editor with the exception that checkboxes remain toggleable, like GitHub

\\
- [x] done
- [ ] todo`,
};

export const PersistedArgs = {
  storyTitle: 'Persisted',

  defaultValue:
    localStorage.getItem('saved') ||
    `# Persisted

The contents of this editor are persisted to local storage on change (edit and reload)`,
  onChange: debounce((value) => {
    // export const text = value();
    const text = value();
    localStorage.setItem('saved', text);
  }, 250),
};

export const PlaceholderArgs = {
  storyTitle: 'Placeholder',

  defaultValue: '',
  placeholder: 'This is a custom placeholder…',
};

export const FocusedArgs = {
  storyTitle: 'Focused',

  autoFocus: true,
  defaultValue: `# Focused

  This editor starts in focus`,
};

export const DarkArgs = {
  storyTitle: 'Dark',

  dark: true,
  defaultValue: `# Dark

There's a customizable dark theme too`,
};

export const RTLArgs = {
  storyTitle: 'RTL direction',
  dir: 'rtl',
  defaultValue: `# خوش آمدید
متن نمونه برای نمایش پشتیبانی از زبان‌های RTL نظیر فارسی، عربی، عبری و ...
\\
- [x] آیتم اول
- [ ] آیتم دوم`,
};
