<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// AuthLayout is intentionally minimal to focus on the authentication components
// No additional setup needed
</script>

<style lang="scss">
.auth-container {
  width: 100%;
  min-height: 100vh;
}
</style>
