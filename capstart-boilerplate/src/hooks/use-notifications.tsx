import { useCallback, useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

type ReceiveStatus = 'prompt' | 'granted' | 'denied' | 'unknown';

interface PermissionStatus {
    receive: ReceiveStatus;
}

interface UsePushNotificationsResult {
    permissionStatus: PermissionStatus | null;
    registrationToken: string | null;
    requestPermissionAndRegister: () => Promise<void>;
    checkPermissions: () => Promise<void>;
}

/*
 * TIPS
 * - Don't ask notification permission when the app opens.
 * - Ask permission only when the user clicks the feature that needs notifications.
 * - On app launch, only read/check current permission state.
 */
export const usePushNotifications = (): UsePushNotificationsResult => {
    const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
    const [registrationToken, setRegistrationToken] = useState<string | null>(null);
    const isNative = Capacitor.getPlatform() !== 'web';

    const checkPermissions = useCallback(async () => {
        if (!isNative) return;
        const permStatus = await PushNotifications.checkPermissions();
        setPermissionStatus(permStatus as PermissionStatus);
    }, [isNative]);

    const requestPermissionAndRegister = useCallback(async () => {
        if (!isNative) {
            console.log('Push notifications not supported on web platform');
            return;
        }

        let permStatus = await PushNotifications.checkPermissions();

        setPermissionStatus(permStatus as PermissionStatus);

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
            setPermissionStatus(permStatus as PermissionStatus);
        }

        if (permStatus.receive === 'granted') {
            await PushNotifications.register();
        }
    }, [isNative]);

    useEffect(() => {
        console.log('Checking Push notification permission');

        if (!isNative) return;

        const addListeners = async () => {
            await PushNotifications.addListener('registration', token => {
                setRegistrationToken(token.value);
                /*
                 * ==========================
                 * SEND TOKEN TO API
                 * ==========================
                 */
                console.log('Push registration success, token: ', token.value);
            });

            await PushNotifications.addListener('registrationError', err => {
                console.error('Registration error: ', err.error);
            });

            await PushNotifications.addListener('pushNotificationReceived', notification => {
                console.log('Push notification received: ', notification);
            });

            await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
                console.log('Push notification action performed', notification.actionId, notification.inputValue);
            });
        };

        const initializeRegistration = async () => {
            const permission = await PushNotifications.checkPermissions();
            setPermissionStatus(permission as PermissionStatus);
            if (permission.receive === 'granted') {
                console.log('Registering push notifications on app launch...');
                await PushNotifications.register();
            }
        };

        addListeners().then(() => initializeRegistration());

        return () => {
            PushNotifications.removeAllListeners();
        };
    }, [isNative]);

    return {
        permissionStatus,
        registrationToken,
        requestPermissionAndRegister,
        checkPermissions,
    };
};
