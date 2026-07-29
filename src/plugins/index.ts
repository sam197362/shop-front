import type { App } from 'vue'

/**
 * plugins/index.ts
*
* Automatically included in `./src/main.ts`
*/
import VueFileAgentNext from '@boindil/vue-file-agent-next'
import { createPinia } from 'pinia'
import router from '../router'
import vuetify from './vuetify'
import '@boindil/vue-file-agent-next/dist/vue-file-agent-next.css'

export function registerPlugins (app: App) {
  app.use(vuetify)
  app.use(createPinia())
  app.use(router)
  app.use(VueFileAgentNext)
}
