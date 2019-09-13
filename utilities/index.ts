export function isUserADoctor(user): boolean {
  if (!user) {
    return false;
  }

  return (
    user.signInUserSession.accessToken.payload["cognito:groups"] &&
    user.signInUserSession.accessToken.payload["cognito:groups"].includes(
      "Doctor"
    )
  );
}
