# Hello World

A **example**.

```js
const v1 = 1234;
```

## usage

```js
unified()
  .use(parser)
  .use(stringify)
  .use(codeblocks, { lang: 'js' })
  .process(toVfile.readSync('./readme.md'))
  .then((file) => {
    const code = file.data.codeblocks.join('\n');
    console.log(code);
  });
```
