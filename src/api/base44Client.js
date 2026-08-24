// Local stub — the app no longer depends on the Base44 SDK at runtime.
// Dashboard data is loaded from local JSON (public/data/*.json) via fetch.
// This export is kept only so legacy imports (e.g. the platform-managed
// AuthContext) still resolve without the Base44 SDK being active.
export const base44 = {
  entities: {},
  auth: {
    me: async () => null,
    logout: () => {},
    redirectToLogin: () => {},
  },
};