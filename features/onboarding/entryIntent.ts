/**
 * One-shot hint from onboarding about which auth screen the learner chose.
 * Finishing onboarding flips the route guard, which lands on Sign In (the
 * auth group's first screen); Sign In then forwards to Create Account when the
 * learner pressed "Get Started", so Back from Create Account returns to Sign In.
 */
let intent: 'sign-up' | null = null;

export function setAuthEntryIntent(next: 'sign-up' | null): void {
  intent = next;
}

export function consumeAuthEntryIntent(): 'sign-up' | null {
  const current = intent;
  intent = null;
  return current;
}
