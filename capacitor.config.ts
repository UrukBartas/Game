import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urukbartas.game',
  appName: 'Uruk Bartas',
  webDir: 'dist/game-app',
  server: {
    androidScheme: 'http',
  },
  plugins: {
    SplashScreen: {
      androidSplashResourceName: 'splash',
      androidBackgroundColor: '#FFFFFF', // Cambia este valor al color deseado
    },
  },
};

export default config;
