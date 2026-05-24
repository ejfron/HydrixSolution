<template>
  <div class="min-h-screen bg-white">
    <div id="main">
      <Navi />
      <Heropage />
     <Features />
     
      <Howitworks />
      <Pricing />
       
        <Dashbordpreview />
      <Cta />
      <Footer />
    </div>



  







  

  


  </div>
</template>

<script setup lang="ts">
import Cta from '~/components/landingpage/Cta.vue';
import Dashbordpreview from '~/components/landingpage/dashbordpreview.vue';
import Features from '~/components/landingpage/features.vue';
import Footer from '~/components/landingpage/footer.vue';
import Heropage from '~/components/landingpage/heropage.vue';
import Howitworks from '~/components/landingpage/howitworks.vue';
import Navi from '~/components/landingpage/navi.vue';
import Pricing from '~/components/landingpage/pricing.vue';



// Interactive dispenser state

</script>

<style scoped>
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #0ea5e9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #0284c7;
}
</style>