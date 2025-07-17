import { createApp } from "vue";
import App from "./NotesApp.vue";
import { createPinia } from 'pinia';

createApp(App).use(createPinia()).mount("#root");