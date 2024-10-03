export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    perfumes: '/dashboard/perfumes',
    notes: '/dashboard/notes',
    parfumers: '/dashboard/parfumers',
    settings: '/dashboard/settings',
    
  },
  errors: { notFound: '/errors/not-found' },
} as const;
