declare const process: {
  env: {
    NUXT_PUBLIC_SUPABASE_URL?: string
    NUXT_PUBLIC_SUPABASE_KEY?: string
    SUPABASE_SERVICE_ROLE_KEY?: string
    PAYMONGO_SECRET_KEY?: string
    PAYMONGO_WEBHOOK_SECRET?: string
    PAYMONGO_PUBLIC_KEY?: string
    SUPABASE_URL?: string
    NODE_ENV?: string
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  nitro: {
    typescript: {
      tsConfig: {
        compilerOptions: {
          types: ['node']
        }
      }
    }
  },

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

  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: false,
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      
      secure: process.env.NODE_ENV === 'production',
    },
  },

  runtimeConfig: {
 
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    paymongoSecretKey: process.env.PAYMONGO_SECRET_KEY,     
  paymongoWebhookSecret: process.env.PAYMONGO_WEBHOOK_SECRET, 

    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      paymongoPublicKey: process.env.PAYMONGO_PUBLIC_KEY,  
    }
  },

  css: ['~/assets/css/main.css'],

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
      title: 'Hydrix Software Solutions',
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/logo.svg'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,400;0,700&display=swap'
        }
      ]
    }
  }
})