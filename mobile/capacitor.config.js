/** @type {import('@capacitor/cli').CapacitorConfig} */
// The Android app bundles the React build. cleartext allows a local HTTP API on trusted Wi-Fi.
const config = {
  appId: 'id.koperasi.rofis', appName: 'Koperasi Rofis', webDir: '../web/dist',
  server: { cleartext: true }, android: { allowMixedContent: true }
};
module.exports = config;
