import gql from "graphql-tag";

export default gql`
  query ListDoctorsByCounty($nextToken: String, $metadata: String!) {
    getDoctorsByCounty(nextToken: $nextToken, metadata: $metadata) {
      items {
        id
        name
        address
        county
        specialty
        newPatients
        phone
        latitude
        longitude
        receiveChats
        bio
        image
        medToken
        insuranceAccpeted
        firstVisit
        followUp
        renewal
        bookingFee
        visitLength
      }
      nextToken
    }
  }
`;
