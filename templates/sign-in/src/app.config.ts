/**
 * App settings. Start here: the name, links, and which screens and options are shown.
 * Everything is plain data, so the app keeps working while you edit it.
 */
export const appConfig = {
  name: 'Acme',

  /** Where people go after signing in. Replace with your app's URL or route. */
  afterSignInHref: '#/signed-in',

  /** Linked from the create-account screen. */
  links: {
    terms: 'https://example.com/terms',
    privacy: 'https://example.com/privacy',
  },

  /** Turn screens and options off without deleting any code. */
  features: {
    /** "Create an account" screen and links to it. */
    signUp: true,
    /** "Forgot your password?" link, and the reset screens. */
    forgotPassword: true,
    /** Ask for a 6-digit code after the password (two-step sign-in). */
    twoStep: true,
    /** "Keep me signed in" checkbox. */
    rememberMe: true,
    /** Accent-coloured panel beside the form on wide screens. */
    sidePanel: true,
  },

  /** Minimum length for new passwords. Check it again on your server. */
  passwordMinLength: 12,

  /** Shown in the side panel on wide screens. */
  sidePanel: {
    title: 'Everything your team needs, in one place.',
    points: [
      'Plan work and track progress together',
      'Share updates without the meetings',
      'Your data stays yours',
    ],
  },

  /**
   * Shows hints for trying the demo (which password fails, the 6-digit code, a reset link).
   * Set to false once src/auth/api.ts talks to your backend.
   */
  demo: true,
};
