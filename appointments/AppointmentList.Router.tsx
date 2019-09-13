import React, { memo, useContext } from "react";
import AppContext from "../AppContext";

import AppointmentListDoctor from "./AppointmentList.Doctor";
import AppointmentListPatient from "./AppointmentList.Patient";

export default memo(function AppointmentListRouter({ navigation }) {
  const { isUserADoctor } = useContext(AppContext);

  if (isUserADoctor) {
    return <AppointmentListDoctor navigation={navigation} />;
  } else {
    return <AppointmentListPatient navigation={navigation} />;
  }
});
