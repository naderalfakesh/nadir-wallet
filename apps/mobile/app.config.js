// Layers machine-specific signing details over the static app.json so nothing
// account-bound is committed. Expo loads apps/mobile/.env before evaluating
// this file, so APPLE_TEAM_ID can live there.
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    ...(process.env.APPLE_TEAM_ID ? { appleTeamId: process.env.APPLE_TEAM_ID } : {}),
  },
});
