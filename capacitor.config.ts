import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.urukbartas.game',
  appName: 'Uruk Bartas',
  webDir: 'dist/game-app',
  server: {
    androidScheme: 'https',
  },
}

export default config
