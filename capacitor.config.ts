import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'es.turel.mir',
  appName: 'MIR Turel',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://mir.turel.es',
    cleartext: false
  }
};

export default config;
