import gql from "graphql-tag";

export default gql`
  query getAppointmentsByPatient($patientId: ID!) {
    getAppointmentsByPatient(patientId: $patientId) {
      items {
        id
        date
        status
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
      nextToken
    }
  }
`;
