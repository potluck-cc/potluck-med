const URL =
  "https://rgz6pxjse1.execute-api.us-east-1.amazonaws.com/dev/sendpushnotification";

export interface PushNotification {
  pushToken: string;
  message: string;
  data?: { [key: string]: any };
}

export async function sendPushNotification(
  pushNotifications: PushNotification[]
) {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ notifications: pushNotifications })
    });

    return res;
  } catch (e) {
    return e;
  }
}
