const routes = [
  // Redirect root to login
  {
    path: '/',
    redirect: '/login',
  },

  // Auth Layout
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('pages/auth/SignupPage.vue'),
      },
    ],
  },

  // Main layout (dashboard, index, etc.)
  {
    path: '/main',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'main', // Add name to the main route too
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/SettingsPage.vue'),
      },
    ],
  },

  // Secret page - FIXED: Move name to child route
  {
    path: '/secret',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'secret', // Move the name here to the actual component route
        component: () => import('pages/SecretPage.vue'),
      },
    ],
  },

  // Catch-all 404
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
