import React, { useEffect, memo } from "react";
import { View, ActivityIndicator } from "react-native";
import { isUserADoctor } from "../utilities";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
};

function AppLoading({ navigation: { navigate, getParam } }: Props) {
  const recentlyLoggedInUser = getParam("user", null);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize(): Promise<void> {
    const { retrieveData, destroyData } = await import("@potluckmarket/ella");

    const introductionComplete = await retrieveData("introductionComplete");

    if (!recentlyLoggedInUser) {
      try {
        const { Auth } = await import("aws-amplify");

        // destroyData("introductionComplete");
        // Auth.signOut();

        const user = await Auth.currentAuthenticatedUser();

        if (user && isUserADoctor(user) && introductionComplete) {
          navigate("DoctorApp");
        } else if (user && !isUserADoctor(user) && introductionComplete) {
          navigate("PatientApp");
        } else if (user && !introductionComplete) {
          navigate("IntroSlider", {
            doctor: isUserADoctor(user)
          });
        } else {
          navigate("Auth");
        }
      } catch {
        navigate("Auth");
      }
    } else {
      if (!introductionComplete) {
        navigate("IntroSlider");
      } else if (introductionComplete && recentlyLoggedInUser.doctor) {
        navigate("DoctorApp");
      } else if (introductionComplete && !recentlyLoggedInUser.doctor) {
        navigate("PatientApp");
      }
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "white"
      }}
    >
      <ActivityIndicator animating size="large" color="black" />
    </View>
  );
}

export default memo(AppLoading);
