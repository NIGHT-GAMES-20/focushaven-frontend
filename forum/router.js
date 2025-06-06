import { createRouter, createWebHistory } from 'vue-router';
import QuestionView from './views/QuestionView.vue';

const routes = [
  {
    path: '/forum/question/:id',
    component: QuestionView,
    props: true
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
