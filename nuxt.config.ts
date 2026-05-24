export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false }, // disable in production

  modules: [
    '@nuxt/ui',
    ['@nuxtjs/supabase', {
      redirectOptions: {
        login: '/loginpage',
        callback: '/confirm',
        exclude: ['/', '/registerpage', '/loginpage'],
      }
    }],
  ],

  css: ['~/assets/css/main.css'],

  // Security headers
  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      }
    }
  },

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,400;0,700&display=swap'
        }
      ]
    }
  }
})