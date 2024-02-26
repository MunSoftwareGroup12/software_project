<template>
  <div class="home">
    <HelloWorld msg="Welcome to skiing!"/>
  <nav>
    <router-link to="/map">Show Map</router-link>
  </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HelloWorld from '@/components/HelloWorld.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    HelloWorld,
  },
});
</script>
