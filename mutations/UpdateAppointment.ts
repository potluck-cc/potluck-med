import gql from "graphql-tag";

export default gql`
  mutation UpdateAppointment($id: ID!, $status: AppointmentStatus) {
    updateAppointment(input: { id: $id, status: $status }) {
      id
      status
    }
  }
`;
