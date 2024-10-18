<template>
  <v-footer 
    height="40" 
    color="primary"
    app>    

    <div
      class="text-caption"
      style="position: absolute; right: 16px;"
    >
      &copy; {{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block"></span>
      —
      <a
        style="color: white;"
        class="text-decoration-none" 
        href="https://homepage.teksystem.com.br/"
        rel="noopener noreferrer"
        target="_blank"
      >
        Tek-System Informática
      </a>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
</script>

<style scoped lang="sass">
</style>
