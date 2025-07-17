import { createApp } from "vue";
import App from "./ForumMain.vue";
import { createPinia } from 'pinia';

createApp(App).use(createPinia()).mount("#root");