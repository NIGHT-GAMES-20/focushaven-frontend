<template>
  <div class="notification-container">
    <div
      v-for="(note, i) in notifications"
      :key="i"
      class="notification"
      :class="note.type"
    >
      <h4>{{ note.title }}</h4>
      <p>{{ note.message }}</p>
      <div v-if="note.details" class="details">
        <span v-for="(value, key) in note.details" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const notifications = ref([]);

function addNotification({ title, message, details = null, type = "info" }) {
  notifications.value.push({ title, message, details, type });

  // Auto remove after 5s
  setTimeout(() => notifications.value.shift(), 5000);
}

defineExpose({ addNotification });
</script>

<style>
.notification-container {
  position: fixed;
  bottom: 1rem;   /* 👈 change to top: 1rem; if you want top-right */
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
}

.notification {
  background: #fff;
  border-left: 5px solid #ccc;
  padding: 12px 16px;
  width: 280px;
  border-radius: 6px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  animation: slidein 0.3s ease;
}

.notification h4 {
  margin: 0 0 5px;
  font-size: 16px;
}

.notification p {
  margin: 0 0 5px;
  font-size: 14px;
}

.notification .details {
  font-size: 13px;
  background: #f9f9f9;
  padding: 6px;
  border-radius: 4px;
}

.notification.success { border-color: green; }
.notification.error { border-color: red; }
.notification.info { border-color: blue; }

@keyframes slidein {
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
