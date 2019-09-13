import gql from "graphql-tag";

export default gql`
  query GetAppointment($id: ID!) {
    getAppointment(id: $id) {
      id
      date
      status
      patient {
        firstname
        lastname
        phone
        email
        token
      }
      doctor {
        id
        name
        address
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
  }
`;
