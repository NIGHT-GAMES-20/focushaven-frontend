<template>
  <div>
    <p>Route ID: {{ routeId }}</p>
    <p>Data will be fetched based on the route ID.</p>
    <p>{{ dataRef }}</p>
  </div>
</template>

<script setup>
  import { onMounted,ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { secureFetch } from '../../scripts/forumSecureFetch';

  const route = useRoute()
  const routeId = route.params.id;
  const dataRef = ref(null);

  // You can use routeId in your component logic
  console.log('Route ID:', routeId);

  // Fetch data using the route ID
  async function fetchData() {
    try {
      const response = await secureFetch(`${import.meta.env.VITE_BACKEND_URL}/forum/question/data/${routeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      dataRef.value = data;
      console.log('Fetched data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  onMounted(() => {
    fetchData();
  });
</script>