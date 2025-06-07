import { createRouter, createWebHistory } from 'vue-router';
import QuestionView from '../../components/Question/QuestionView.vue';

const routes = [
  {
    path: '/forum/question/:id',
    component: QuestionView
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
