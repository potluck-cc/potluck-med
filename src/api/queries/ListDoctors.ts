import gql from "graphql-tag";

export default gql`
  query listDoctors($nextToken: String) {
    listDoctors(nextToken: $nextToken, limit: 40) {
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
