import { createApp } from 'vue';
import { router } from './router';
import QuestionApp from './QuestionView.vue';

const app = createApp(QuestionApp);
app.use(router);
app.mount('#app');
