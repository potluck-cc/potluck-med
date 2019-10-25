import AWSAppSyncClient from "aws-appsync";
import appSyncConfig from "./AppSync";
import { Auth } from "aws-amplify";

export default new AWSAppSyncClient({
  url: appSyncConfig.aws_appsync_graphqlEndpoint,
  region: appSyncConfig.aws_appsync_region,
  auth: {
    type: appSyncConfig.aws_appsync_authenticationType,
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken()
  },
  disableOffline: true
});
