import React, { memo, useContext } from "react";
import { View } from "react-native";
import AppIntroSlider from "react-native-app-intro-slider";
import Welcome from "./Welcome";
import { storeData } from "@potluckmarket/ella";
import Directory from "./Directory";
import AppContext from "appcontext";
import Messages from "./Messages";
import Appointments from "./Appointments";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

enum SlideType {
  welcome = "welcome",
  directory = "directory",
  settings = "settings",
  messages = "messages",
  appointments = "appointments"
}

const doctorSlides = [
  {
    key: SlideType.welcome
  },
  {
    key: SlideType.messages
  },
  {
    key: SlideType.appointments
  }
];

const patientSlides = [
  {
    key: SlideType.welcome
  },
  {
    key: SlideType.directory
  },
  {
    key: SlideType.messages
  },
  {
    key: SlideType.appointments
  }
];

function IntroSlider({ navigation: { navigate } }: Props) {
  const { isUserADoctor } = useContext(AppContext);

  function renderSlide({ item: { key } }) {
    switch (key) {
      case SlideType.welcome:
        return <Welcome />;
      case SlideType.directory:
        return <Directory />;
      case SlideType.messages:
        return <Messages isUserADoctor={isUserADoctor} />;
      case SlideType.appointments:
        return <Appointments />;
      default:
        return <View />;
    }
  }

  return (
    <AppIntroSlider
      renderItem={renderSlide}
      slides={isUserADoctor ? doctorSlides : patientSlides}
      dotStyle={{ backgroundColor: "#eee" }}
      activeDotStyle={{ backgroundColor: "black" }}
      buttonTextStyle={{ color: "black" }}
      showNextButton={false}
      onDone={async (): Promise<void> => {
        await storeData("introductionComplete", "true");
        navigate("AppLoading");
      }}
    />
  );
}

export default memo(IntroSlider);
