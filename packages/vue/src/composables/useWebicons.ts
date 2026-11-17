// File: packages/vue/src/composables/useWebicons.ts | Map: version ref -> follows registerWebicons / addWebicons
// A reactive counter, so every OcWebicon draws again once an app registers icons (also after the first render).
import { shallowRef } from 'vue'
import { subscribeWebicons, webiconsVersion } from '../webicons'

export const webiconTick = shallowRef(webiconsVersion())
subscribeWebicons(() => {
  webiconTick.value = webiconsVersion()
})
