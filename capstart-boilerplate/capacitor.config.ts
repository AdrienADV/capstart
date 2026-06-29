import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.capstart.app',
  appName: 'Capstart',
  webDir: 'dist',
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      style: "LIGHT",
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true
    }
  },
};

export default config;
