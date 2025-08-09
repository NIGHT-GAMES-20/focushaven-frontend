<template>
  <div>
    <h2>Parent Component</h2>
    <p>Route ID: {{ routeId }}</p>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute()
  const routeId = route.params.id;

  // You can use routeId in your component logic
  console.log('Route ID:', routeId);

  // Fetch data using the route ID
  async function fetchData() {
    try {
      const response = await secureFetch(`${import.meta.env.VITE_BACKEND_URL}/question/data/${routeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Fetched data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function getValidToken() {
    let token = sessionStorage.getItem('formAuthToken');

    if (!token || isTokenExpired(token)) {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/forum/auth/token`, { method: 'POST',headers: { 'Origin': window.location.origin } });
      const data = await res.json();
      sessionStorage.setItem('formAuthToken', data.token);
      return data.token;
    }

    return token;
  }

  function isTokenExpired(token) {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  }

  async function secureFetch(url, options = {}) {
    const token = await getValidToken();
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return fetch(url, options);
  }

  onMounted(() => {
    fetchData();
  });
</script>