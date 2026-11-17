# @birdycom/omniaui-react

React 18/19 function components for [OmniaCSS](https://github.com/Birdycom/omniacss). Every component and block renders the exact markup and classes of the HTML snippets in `@birdycom/omniaui` and `@birdycom/omniaui-blocks`; the CSS packages own all styling.

```bash
npm install @birdycom/omniaui-react @birdycom/omniaui @birdycom/omniaui-blocks react react-dom
```

```tsx
import { Button, Modal, ModalClose, ToastProvider, useToast } from "@birdycom/omniaui-react";

<Button variant="outline" size="sm">Save</Button>
```

- Props map to modifiers: `variant`, `size` (`sm`/`md`/`lg`), boolean flags; slots are `children` plus named props (`title`, `description`, `actions`, `footer`).
- `ref` is forwarded, rest props are spread, `className` is merged.
- Dialogs (`Modal`, `AlertDialog`, `Sheet`, `BlockWizardDialog`) sync an `open` prop with the native `<dialog>`; dropdowns and popovers use the native `popover` attribute.
- Wrapper logic lives in the components: `Command` filtering, `PasswordInput` reveal, `CopyField`, toast queue (`ToastProvider` + `useToast`).
- Icons by name: `<Webicon name="mdi:home" size="md" />` draws the OmniaCSS webicons (MDI, MDI Light, Material Symbols, SVG Spinners, Flags, VSCode Icons) as inline SVG, without a network call. Register the icons you use once: `npx omniaui webicons --scan src --out src/webicons.json`, then `addWebicons(icons)` (or `registerWebicons(set)` with an `@iconify-json/<set>` file). Components with an icon or flag prop draw it the same way.
- `src/` is published too: copy a file into your project to own the code. `manifest.json` lists `{ name, kind, file, snippet }` for every item.

MIT
