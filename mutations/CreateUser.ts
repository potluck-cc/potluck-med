import gql from "graphql-tag";

export default gql`
  mutation CreateUser(
    $id: ID!
    $firstname: String
    $lastname: String
    $email: AWSEmail
    $phone: AWSPhone
    $token: String
  ) {
    createUser(
      input: {
        id: $id
        firstname: $firstname
        lastname: $lastname
        email: $email
        phone: $phone
        token: $token
      }
    ) {
      id
      firstname
      lastname
      email
      phone
      token
    }
  }
`;
