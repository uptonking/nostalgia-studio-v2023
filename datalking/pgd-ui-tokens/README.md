# @pgd/ui-tokens

> design tokens for pgd(prospect garden design system)

# overview
- compile w3c compliant design tokens to css variables and js variables
# usage
- write your design tokens in `./src/tokens/theme-tailwind.tokens.json`
  - everytime tokens are updated, you need to rebuild using `npm run build:tokens`
  - the building outputs to `./src/outputs`; don't edit files in this folder

```typescript
// import css variables at the entry of your application
import '@pgd/ui-tokens/pgd-t-tailwind.css';

// 💡 usecase 1: import token values if needed while creating components
import {tokens} from '@pgd/ui-tokens';

// typescript autocomplete works. The value here is raw literals, like #fafafa
<div style={{backgroundColor: tokens['color.brand.primary']}} />

// 💡 usecase 2: tokens also works in css in js.
import {themed} from '@pgd/ui-tokens';

// The value here is css variables,like var(--pgd-color-brand-primary)
const StyledDiv = styled.dev`
background-color: themed.color.brand.primary;
`;
```

# roadmap
- [ ] typography composite type outputs 2 css variables
  - but custom conversion script only outputs 1
