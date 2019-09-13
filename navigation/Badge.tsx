import React, { memo, useContext, useEffect } from "react";
import { Badge } from "react-native-elements";
import AppContext from "../AppContext";
import { Notifications } from "expo";

export default memo(function GenericBadge({
  message = false,
  appointment = false,
  focused = false
}) {
  const {
    messageNotifications,
    appointmentNotifications,
    setAppointmentNotifications,
    setMessageNotifications
  } = useContext(AppContext);

  const count = message ? messageNotifications : appointmentNotifications;

  useEffect(() => {
    if (focused) {
      message && count
        ? setMessageNotifications(0)
        : setAppointmentNotifications(0);
    }
  }, [focused]);

  return (
    <Badge
      status="error"
      value={count ? 1 : 1}
      containerStyle={{
        opacity: count > 0 ? 1 : 0,
        position: "absolute",
        left: 20,
        top: -5
      }}
    />
  );
});
