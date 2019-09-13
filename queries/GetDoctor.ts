import gql from "graphql-tag";

export default gql`
  query GetDoctor($id: ID!) {
    getDoctor(id: $id) {
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
