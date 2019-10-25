module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            assets: "./assets",
            queries: "./src/api/queries/index.ts",
            mutations: "./src/api/mutations/index.ts",
            subscriptions: "./src/api/subscriptions/index.ts",
            appointments: "./src/appointments/index.ts",
            auth: "./src/authentication/index.ts",
            common: "./src/common/index.ts",
            doctor: "./src/doctor/index.ts",
            introduction: "./src/introduction/index.ts",
            messaging: "./src/messaging/index.ts",
            navigation: "./src/navigation/index.tsx",
            patient: "./src/patient/index.ts",
            layout: "./src/layout/index.ts",
            utilities: "./src/utilities/index.ts",
            appcontext: "./AppContext.ts",
            client: "./client.ts"
          }
        }
      ]
    ]
  };
};
