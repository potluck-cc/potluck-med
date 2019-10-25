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
        medToken
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
        medToken
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
