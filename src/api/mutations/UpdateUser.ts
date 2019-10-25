import gql from "graphql-tag";

export default gql`
  mutation UpdateUser(
    $id: ID!
    $confirmed: Boolean
    $firstname: String
    $lastname: String
    $patientID: String
    $expiration: String
    $email: AWSEmail
    $phone: AWSPhone
    $dob: String
    $issued: String
    $street: String
    $city: String
    $state: State
    $medToken: String
  ) {
    updateUser(
      input: {
        id: $id
        confirmed: $confirmed
        firstname: $firstname
        lastname: $lastname
        patientID: $patientID
        expiration: $expiration
        email: $email
        phone: $phone
        dob: $dob
        issued: $issued
        street: $street
        city: $city
        state: $state
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
