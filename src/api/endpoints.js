// #genai: One place to see every backend route the app depends on.
export const endpoints = {
  health: '/health',
  healthReady: '/health/ready',

  auth: {
    signUp: '/auth/sign-up',
    signIn: '/auth/sign-in',
    signOut: '/auth/sign-out',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    updatePassword: '/auth/password',
    resendConfirmation: '/auth/resend-confirmation',
    oauthUrl: '/auth/oauth/url',
    oauthCallback: '/auth/oauth/callback',
  },

  profile: {
    root: '/profile',
    onboarding: '/profile/onboarding',
    onboardingIdentity: '/profile/onboarding/identity',
    onboardingFinancial: '/profile/onboarding/financial',
    onboardingGoal: '/profile/onboarding/goal',
  },

  cards: {
    search: '/cards',
  },

  userCards: {
    root: '/user-cards',
    remove: (userCardId) => `/user-cards/${userCardId}/remove`,
  },

  swipemax: {
    compare: '/swipemax/compare',
    capConsumption: (capId) => `/swipemax/caps/${capId}/consumption`,
    capSelfReport: (capId) => `/swipemax/caps/${capId}/self-report`,
    chatSessions: '/swipemax/chat/sessions',
    chatSession: (sessionId) => `/swipemax/chat/sessions/${sessionId}`,
    chatMessages: (sessionId) => `/swipemax/chat/sessions/${sessionId}/messages`,
  },
};
