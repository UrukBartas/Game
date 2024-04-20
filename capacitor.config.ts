import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urukbartas.game',
  appName: 'Uruk Bartas - Play & Earn RPG',
  webDir: 'dist/game-app',
  server: {
    androidScheme: 'http',
  },
};

export default config;
