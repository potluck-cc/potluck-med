import gql from "graphql-tag";

export default gql`
  mutation UpdateDoctor(
    $id: ID!
    $receiveChats: Boolean
    $bio: String
    $image: AWSURL
    $phone: String
    $token: String
    $insuranceAccpeted: Boolean
    $firstVisit: String
    $followUp: String
    $renewal: String
    $bookingFee: String
    $visitLength: String
  ) {
    updateDoctor(
      input: {
        id: $id
        receiveChats: $receiveChats
        bio: $bio
        image: $image
        phone: $phone
        token: $token
        insuranceAccpeted: $insuranceAccpeted
        firstVisit: $firstVisit
        followUp: $followUp
        renewal: $renewal
        bookingFee: $bookingFee
        visitLength: $visitLength
      }
    ) {
      id
      address
      county
      latitude
      longitude
      name
      newPatients
      phone
      specialty
      receiveChats
      bio
      image
      token
      insuranceAccpeted
      firstVisit
      followUp
      renewal
      bookingFee
      visitLength
    }
  }
`;
