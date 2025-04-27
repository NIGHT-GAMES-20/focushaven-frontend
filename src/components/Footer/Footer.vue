<script setup>
    import styles from './footer.module.css'
    const year = new Date().getFullYear()
</script>

<template>
     <footer :class="styles.footer">
            <p>© {{ year }} FOCUS HAVEN. All Rights Reserved.</p>
    </footer>
</template>