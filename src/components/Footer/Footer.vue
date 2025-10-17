<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const showFullFooter = ref(false)
const canScroll = ref(false)

const checkScrollable = () => {
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  )
  const winHeight = window.innerHeight
  canScroll.value = docHeight > winHeight + 10
  if (!canScroll.value) showFullFooter.value = false
}

const handleScroll = () => {
  if (!canScroll.value) return
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  )
  showFullFooter.value = scrollTop + windowHeight >= docHeight - 100
}

onMounted(async () => {
  await nextTick()
  checkScrollable()
  window.addEventListener('resize', checkScrollable)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScrollable)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <footer
    class="footer"
    @mouseenter="!canScroll && (showFullFooter = true)"
    @mouseleave="!canScroll && (showFullFooter = false)"
  >
    <!-- Mini bar -->
    <div class="miniBar">
      <p>© {{ new Date().getFullYear() }} FOCUS HAVEN. All Rights Reserved.</p>
    </div>

    <!-- Full footer -->
    <transition name="footer-slide">
      <div v-if="showFullFooter" >
        <div class="fullFooter">
          <!-- Pages Section -->
          <div class="footerSection">
            <h3>Pages</h3>
            <ul>
              <li><a href="/about" target="_blank" rel="noopener noreferrer">About Us</a></li>
              <li><a href="https://stats.uptimerobot.com/kE0tIJpxEl" target="_blank" rel="noopener noreferrer">Status</a></li>
            </ul>
          </div>

          <!-- Contact Section -->
          <div class="footerSection">
            <h3>Contact</h3>
            <ul>
              <li><a href="mailto:focushavenofficial@gmail.com" target="_blank" rel="noopener noreferrer">Mail Us</a></li>
            </ul>
          </div>

          <!-- Social Section -->
          <div class="footerSection">
            <h3>Follow Us</h3>
            <ul>
              <li><a href="https://instagram.com/_focushaven_" target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li><a href="https://whatsapp.com/channel/0029VbAFcg3HbFUykvENYs3b" target="_blank" rel="noopener noreferrer">WhatsApp Channel</a></li>
            </ul>
          </div>
        </div>
        <div class="madebyTag">
          <h5>Made With Love 💙 by Silver [<a href="https://instagram.com/night_games_20" target="_blank" rel="noopener noreferrer"> NIGHT_GAMES_20 </a>] </h5>
        </div>

      </div>
    </transition>
  </footer>
</template>

<!-- Import plain CSS -->
<style src="./footer.css"></style>
