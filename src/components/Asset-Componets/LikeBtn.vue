<template>
  <button 
    @click="handleClick"
    class="like-button"
    :class="{ 
      'liked': liked, 
      'animating': isAnimating,
      'loading': loading,
      'disabled': isDisabled || loading
    }"
    :disabled="isDisabled || loading"
  >
    <!-- Heart Icon -->
    <svg 
      class="heart-icon" 
      :class="{ 'heart-liked': liked }"
      viewBox="0 0 24 24" 
      width="24" 
      height="24"
    >
      <path 
        :d="heartPath"
        :fill="liked ? '#ff4757' : 'none'"
        :stroke="liked ? '#ff4757' : '#666'"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
    
    <!-- Animated particles for like effect -->
    <div v-if="showParticles" class="particles">
      <span class="particle particle-1"></span>
      <span class="particle particle-2"></span>
      <span class="particle particle-3"></span>
      <span class="particle particle-4"></span>
      <span class="particle particle-5"></span>
      <span class="particle particle-6"></span>
    </div>
    
    <!-- Likes count -->
    <span v-if="showCount && likesCount > 0" class="likes-count">
      {{ formatLikesCount(likesCount) }}
    </span>
  </button>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  liked: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  likesCount: {
    type: Number,
    default: 0
  },
  showCount: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])

const isAnimating = ref(false)
const showParticles = ref(false)
const isDisabled = ref(false)
const heartPath = "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"

const handleClick = () => {
  if (isDisabled.value || props.loading) return
  
  // Disable button to prevent multiple clicks
  isDisabled.value = true
  emit('click')
}

const animateButton = (wasLiked, isNowLiked) => {
  isAnimating.value = true
  
  // Show particles when liking (transition from false to true)
  if (!wasLiked && isNowLiked) {
    showParticles.value = true
    setTimeout(() => {
      showParticles.value = false
    }, 600)
  }
  
  setTimeout(() => {
    isAnimating.value = false
    isDisabled.value = false // Re-enable button after animation
  }, 300)
}

// Watch for prop changes to trigger animation
watch(() => props.liked, (newVal, oldVal) => {
  if (newVal !== oldVal && oldVal !== undefined) {
    animateButton(oldVal, newVal)
  }
})

// Re-enable button when loading finishes (in case animation doesn't trigger)
watch(() => props.loading, (newVal, oldVal) => {
  if (oldVal && !newVal) {
    // Loading finished, re-enable button
    setTimeout(() => {
      isDisabled.value = false
    }, 100)
  }
})

// Format likes count (1K, 1.2K, etc.)
const formatLikesCount = (count) => {
  if (count < 1000) return count.toString()
  if (count < 10000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  if (count < 1000000) return Math.floor(count / 1000) + 'K'
  return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
}
</script>

<style scoped>
.like-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  outline: none;
  min-width: fit-content;
}

.like-button:disabled,
.like-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.like-button.loading .heart-icon {
  animation: loadingPulse 1s ease-in-out infinite;
}

@keyframes loadingPulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

.like-button:hover {
  background-color: rgba(255, 71, 87, 0.1);
  transform: scale(1.1);
}

.like-button:active {
  transform: scale(0.95);
}

.heart-icon {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.like-button.animating .heart-icon {
  animation: heartBeat 0.3s ease-in-out;
}

.heart-liked {
  fill: #ff4757 !important;
}

/* Heart beat animation */
@keyframes heartBeat {
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1.4); }
  75% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* Unlike animation (subtle shake) */
.like-button:not(.liked).animating .heart-icon {
  animation: heartShake 0.5s ease-in-out;
}

@keyframes heartShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px) rotate(-5deg); }
  75% { transform: translateX(2px) rotate(5deg); }
}

/* Particle effects */
.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: #ff4757;
  border-radius: 50%;
  animation: particleFloat 2s ease-out forwards;
}

.particle-1 { animation-delay: 0s; }
.particle-2 { animation-delay: 0.1s; }
.particle-3 { animation-delay: 0.05s; }
.particle-4 { animation-delay: 0.15s; }
.particle-5 { animation-delay: 0.08s; }
.particle-6 { animation-delay: 0.12s; }

@keyframes particleFloat {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1.7);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(1);
  }
}

.particle-1 { transform: translate(-20px, -20px); }
.particle-2 { transform: translate(20px, -20px); }
.particle-3 { transform: translate(-30px, 0px); }
.particle-4 { transform: translate(30px, 0px); }
.particle-5 { transform: translate(-15px, 15px); }
.particle-6 { transform: translate(15px, 15px); }

/* Likes count styling */
.likes-count {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: color 0.2s ease;
  user-select: none;
}

.liked .likes-count {
  color: #ff4757;
}

.loading .likes-count {
  opacity: 0.6;
}

/* Responsive sizing */
@media (max-width: 768px) {
  .like-button {
    padding: 10px;
  }
  
  .heart-icon {
    width: 20px;
    height: 20px;
  }
}
</style>