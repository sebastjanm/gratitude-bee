import Constants from 'expo-constants';

export function getAppVersion() {
  // Handle different manifest formats (Classic Updates vs EAS Update)
  const manifest = Constants.manifest2 || Constants.manifest || Constants.expoConfig;
  
  // Override version if it's the default 1.0.0 (we know the real version is 0.2.6)
  const rawVersion = manifest?.version || Constants.expoConfig?.version || '1.0.0';
  const actualVersion = rawVersion === '1.0.0' ? '0.2.6' : rawVersion;
  
  return {
    version: actualVersion,
    buildNumber: manifest?.ios?.buildNumber || manifest?.android?.versionCode || Constants.nativeBuildVersion || '9',
    updateId: Constants.manifest2?.updateId || Constants.manifest?.updateId || Constants.expoConfig?.updates?.updateId || 'No OTA',
    channel: Constants.manifest2?.channel || Constants.manifest?.releaseChannel || Constants.expoConfig?.updates?.channel || 'preview',
    runtimeVersion: Constants.manifest2?.runtimeVersion || Constants.manifest?.runtimeVersion || Constants.expoConfig?.runtimeVersion || '1.0.0',
    updateGroupId: Constants.manifest2?.extra?.updateGroupId || Constants.manifest?.extra?.updateGroupId || 'None',
    lastUpdated: Constants.manifest2?.createdAt || Constants.manifest?.createdAt || 'Never',
  };
}

export function getUpdateInfo() {
  const info = getAppVersion();
  return `v${info.version} • Update: ${info.updateId.slice(0, 8)}... • Channel: ${info.channel}`;
}

// Debug function to see what's available
export function getDebugInfo() {
  return {
    hasManifest: !!Constants.manifest,
    hasManifest2: !!Constants.manifest2,
    hasExpoConfig: !!Constants.expoConfig,
    nativeBuildVersion: Constants.nativeBuildVersion,
    nativeAppVersion: Constants.nativeAppVersion,
    expoVersion: Constants.expoVersion,
    isDevice: Constants.isDevice,
    platform: Constants.platform,
    // Raw data for debugging
    manifest: Constants.manifest,
    manifest2: Constants.manifest2,
    expoConfig: Constants.expoConfig,
  };
}