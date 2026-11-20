import * as Haptics from "expo-haptics";
import * as StoreReview from "expo-store-review";
import { bumpSuccessCount } from "./storage";

export async function onSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  const n = await bumpSuccessCount();
  // Ask for a rating once the user has had a few good results.
  if ((n === 3 || n === 15) && (await StoreReview.hasAction().catch(() => false))) {
    setTimeout(() => StoreReview.requestReview().catch(() => {}), 1500);
  }
}
