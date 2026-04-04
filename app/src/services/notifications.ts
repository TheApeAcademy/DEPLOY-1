// Push & local notification helpers for Capacitor (iOS / Android only).
// On web these calls are no-ops — Capacitor stubs them safely.

const isNative = () =>
  typeof (window as any).Capacitor !== 'undefined' &&
  (window as any).Capacitor?.isNativePlatform?.();

export async function initPushNotifications(): Promise<void> {
  if (!isNative()) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive === 'granted') {
      await PushNotifications.register();
    }
    PushNotifications.addListener('registration', (token) => {
      console.log('Push token:', token.value);
      // TODO: save token to Supabase profiles table for targeted notifications
    });
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
    });
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push action performed:', action);
    });
  } catch (err) {
    console.warn('Push notifications not available:', err);
  }
}

export async function triggerLocalNotification(title: string, body: string): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 1000) },
      }],
    });
  } catch (err) {
    console.warn('Local notification failed:', err);
  }
}
