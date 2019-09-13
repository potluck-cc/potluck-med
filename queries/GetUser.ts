import gql from "graphql-tag";

export default gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      firstname
      lastname
      email
      phone
      token
    }
  }
`;
