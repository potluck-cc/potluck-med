import gql from "graphql-tag";

export default gql`
  query listDoctors($nextToken: String, $county: String) {
    listDoctors(nextToken: $nextToken, filter: { county: { eq: $county } }) {
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
        token
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
