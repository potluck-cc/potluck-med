import gql from "graphql-tag";

export default gql`
  mutation CreateUser(
    $id: ID!
    $firstname: String
    $lastname: String
    $email: AWSEmail
    $phone: AWSPhone
    $medToken: String
  ) {
    createUser(
      input: {
        id: $id
        firstname: $firstname
        lastname: $lastname
        email: $email
        phone: $phone
        medToken: $medToken
      }
    ) {
      id
      firstname
      lastname
      email
      phone
      medToken
    }
  }
`;
