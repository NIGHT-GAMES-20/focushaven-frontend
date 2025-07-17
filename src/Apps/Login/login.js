import { createApp } from "vue";
import App from "./LoginApp.vue";
import { createPinia } from 'pinia';

createApp(App).use(createPinia()).mount("#login-root");