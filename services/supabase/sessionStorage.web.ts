/**
 * Web: let supabase-js use its default (window.localStorage).
 * Web is a development/testing target; native builds use encrypted storage.
 */
export const sessionStorage = undefined;
