import { createApp } from "vue";
import App from "./SigninAPP.vue";
import { createPinia } from 'pinia'

createApp(App).use(createPinia()).mount("#signin-root");