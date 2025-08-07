import Constants from 'expo-constants';

export function getAppVersion() {
  return {
    version: Constants.expoConfig?.version || 'Unknown',
    buildNumber: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || 'Unknown',
    updateId: Constants.manifest2?.updateId || Constants.manifest?.updateId || 'No OTA',
    channel: Constants.manifest2?.releaseChannel || Constants.expoConfig?.updates?.channel || 'Unknown',
    runtimeVersion: Constants.manifest2?.runtimeVersion || Constants.expoConfig?.runtimeVersion || 'Unknown',
    updateGroupId: Constants.manifest2?.extra?.updateGroupId || 'None',
    lastUpdated: Constants.manifest2?.createdAt || 'Never',
  };
}

export function getUpdateInfo() {
  const info = getAppVersion();
  return `v${info.version} • Update: ${info.updateId.slice(0, 8)}... • Channel: ${info.channel}`;
}