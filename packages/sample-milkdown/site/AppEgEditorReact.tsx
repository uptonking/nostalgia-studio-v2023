import '../src/themes/nord.css';

import * as React from 'react';

import {
  Blockquote,
  Editor,
  Image,
  Paragraph,
  ReactEditor,
  commonmark,
  useEditor,
  useNodeCtx,
} from '../src/index';

const ReactParagraph: React.FC = ({ children }) => (
  <div className='react-renderer paragraph'>{children}</div>
);

const ReactImage: React.FC = () => {
  const { node } = useNodeCtx();
  return (
    <img
      className='image'
      src={node.attrs.src}
      alt={node.attrs.alt}
      title={node.attrs.tittle}
    />
  );
};

const ReactBlockquote: React.FC = ({ children }) => {
  return <div className='react-renderer blockquote'>{children}</div>;
};

export const AppEgEditorReact: React.FC = () => {
  const editor = useEditor((root, renderReact) => {
    const nodes = commonmark
      .configure(Paragraph, { view: renderReact(ReactParagraph) })
      .configure(Blockquote, { view: renderReact(ReactBlockquote) })
      .configure(Image, { view: renderReact(ReactImage) });

    return new Editor({
      root,
      defaultValue: markdown,
      listener: {
        markdown: [(x) => console.log(x())],
      },
    }).use(nodes);
  });

  return <ReactEditor editor={editor} />;
};

const markdown2 = `
# hello markdown 编辑器
`;

const markdown = `
# Milkdown Test

## Blockquote

> Milkdown is an editor.

## Marks Paragraph

Hello, ***milkdown* nice \`to\` meet *you***!
There should be a line break before this.



---

## Image and Link

**Of course you can add image! ![cat](https://th.bing.com/th/id/OIP.EiYMXYhAnpsXnVmwJAq1jAHaEo?pid=ImgDet&rs=1 "kitty")**

Your *[link is here](https://bing.com "bing")*, have a look.

![Alt text下一行是markdown图片链接用id抽离出去后的url地址，但图片渲染失败][id]][id]
[id]: https://th.bing.com/th/id/OIP.EiYMXYhAnpsXnVmwJAq1jAHaEo?pid=ImgDet&rs=1  "The Cat"

## Lists

* list item 1
    1. is this the real life
    2. is this just fantasy
* list item 2
    * sub list item 1

        some explain

    * sub list item 2
* list item 3

## Code

\`\`\`javascript
const milkdown = new Milkdown();
milkdown.create();
\`\`\`

---

Now you can play!
`;

export default AppEgEditorReact;
