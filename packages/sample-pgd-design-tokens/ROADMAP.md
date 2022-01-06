# roadmap for @pgd/design-tokens

# fix

# new

# refactor

# later

- in dark mode, scrollbar in the page is white and bold.

- provide config to make token name prefix, like `pg-g` `pg-c`, optional

# engineering

# discuss

- style-dictionary: remove `replaceRefs` option in tokens to use built-in support
  - current `replaceRefs`  only replace one ref, but s-d impl supports replacing multi 
  - if removed, u need to impl custom output with references
  - key ideas: replace refs one by one at LOC ` if (token.replaceRefs) {`
