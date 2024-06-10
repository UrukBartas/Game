import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urukbartas.rpg.game',
  appName: 'Uruk Bartas - Play & Earn RPG',
  webDir: 'dist/game-app',
  server: {
    androidScheme: 'http',
  },
};

export default config;
