// Expo loads .env before evaluating this file. Keep local signing settings out
// of the shared app config and give Android device tests their own app storage.
module.exports = ({ config }) => {
  const qa = process.env.NADIR_E2E === "1";
  const app = {
    ...config,
    ios: {
      ...config.ios,
      ...(process.env.APPLE_TEAM_ID ? { appleTeamId: process.env.APPLE_TEAM_ID } : {}),
    },
  };
  if (!qa) return app;

  return {
    ...app,
    name: "Nadir Wallet QA",
    scheme: "nadirwallet-qa",
    android: {
      ...config.android,
      package: `${config.android.package}.qa`,
    },
    plugins: config.plugins.map((plugin) => {
      if (!Array.isArray(plugin) || plugin[0] !== "expo-build-properties") return plugin;
      const [name, properties] = plugin;
      return [name, { ...properties, android: { ...properties.android, usesCleartextTraffic: true } }];
    }),
  };
};
