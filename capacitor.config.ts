import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urukbartas.game',
  appName: 'GameApp',
  webDir: 'dist/game-app',
  server: {
    androidScheme: 'https'
  }
};

export default config;
