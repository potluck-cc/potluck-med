import AWSAppSyncClient from "aws-appsync";
import appSyncConfig from "./AppSync";

export default new AWSAppSyncClient({
  url: appSyncConfig.graphqlEndpoint,
  region: appSyncConfig.region,
  auth: {
    type: appSyncConfig.authenticationType,
    apiKey: appSyncConfig.apiKey
  },
  disableOffline: true
});
