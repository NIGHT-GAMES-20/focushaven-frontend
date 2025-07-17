<script setup>
    import styles from './footer.module.css'
</script>

<template>
     <footer :class="styles.footer">
            <p>© {{ new Date().getFullYear() }} FOCUS HAVEN. All Rights Reserved.</p>
    </footer>
</template>