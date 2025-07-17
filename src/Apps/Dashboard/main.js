import { createApp } from "vue";
import App from "./MainApp.vue";
import { createPinia } from 'pinia';

createApp(App).use(createPinia()).mount("#root");