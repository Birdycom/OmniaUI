<!-- File: packages/vue/README.md -->
# @birdycom/omniaui-vue

Vue 3 components for OmniaCSS: one single-file component (`<script setup lang="ts">`) per component and per block. The markup and classes are exactly those of the HTML snippets in `@birdycom/omniaui` and `@birdycom/omniaui-blocks`; the CSS packages own all styling, the SFCs have no styles.

```sh
npm install @birdycom/omniaui-vue @birdycom/omniaui @birdycom/omniaui-blocks vue
```

```ts
import { createApp } from 'vue'
import { OmniaVue } from '@birdycom/omniaui-vue'

createApp(App).use(OmniaVue).mount('#app') // registers every Oc* component globally
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { OcButton, OcModal, OcToastContainer, useToast } from '@birdycom/omniaui-vue'
const open = ref(false)
const toast = useToast()
</script>

<template>
  <OcButton variant="outline" size="sm" @click="open = true">Open</OcButton>
  <OcModal v-model:open="open" title="Are you sure?">
    <template #footer="{ close }"><OcButton @click="close(); toast.success('Done')">OK</OcButton></template>
  </OcModal>
  <OcToastContainer />
</template>
```

- Props map to modifiers: `variant`, `size` (sm / md / lg), booleans for flags. Slots map to the snippet slots.
- `v-model` on input, select, switch, checkbox, segmented, tabs, tag input, OTP, color field, dropzone; `v-model:open` on modal, alert dialog, sheet, collapsible, wizard.
- Dialogs use `<dialog>` + `showModal()`, menus and popovers the `popover` attribute, accordions `<details name>`.
- Full prop reference: the Vue page in the documentation site (`ui/frameworks-vue.html`).

## Own the code

`src/` is published too. Copy `src/components/OcButton.vue` (plus the `src/composables/*` files it imports) into your project, or import from `@birdycom/omniaui-vue/src/components/OcButton.vue`. `manifest.json` lists every item as `{ name, kind, file, snippet }`.

## Development

```sh
npm run generate -w @birdycom/omniaui-vue   # rewrite src/index.ts and manifest.json from the SFC folders
npm run build -w @birdycom/omniaui-vue      # generate + vite library build + .d.ts
npm test -w @birdycom/omniaui-vue           # vitest + @vue/test-utils (jsdom)
```
