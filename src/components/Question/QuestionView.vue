<template>
  <div>
    <h2>Parent Component</h2>
    <p>Route ID: {{ routeId }}</p>
  </div>
</template>

<script setup>
    import { useRoute } from 'vue-router';

    const route = useRoute()
    const routeId = 1234
</script>