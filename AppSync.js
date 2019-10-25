const client_dev = {
  aws_appsync_graphqlEndpoint:
    "https://tkwq4aqahzeahawpc7bvbasbqu.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
};

const client_prod = {
  aws_appsync_graphqlEndpoint:
    "https://fm3akwvjj5bxhcmxduizrcyfni.appsync-api.us-east-1.amazonaws.com/graphql",
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS"
};

export default __DEV__ ? client_prod : client_prod;
