// This file was created by the assistant to enable dynamic configuration.
// It replaces the static app.json and configures the google-services.json file
// based on an environment variable from EAS Secrets.

export default {
  "expo": {
    "name": "gratitude-bee",
    "slug": "gratitude-bee",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "com.gratitudebee",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.sebastjanm.gratitudebee",
      "buildNumber": "1",
      "associatedDomains": [
        "applinks:gratitudebee.app"
      ],
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      },
      "appleTeamId": "3QA7JH9R8U"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FFF8F0"
      },
      "package": "com.gratitudebee",
      "versionCode": 1,
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "gratitudebee.app",
              "pathPrefix": "/invite"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#FF8C42",
          "iosDisplayInForeground": true
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you set your profile picture."
        }
      ],
      "expo-video"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "ebb8ed4b-00ff-41bc-8e1d-3dbeeeadfe0a"
      }
    },
    "runtimeVersion": "1.0.0",
    "updates": {
      "url": "https://u.expo.dev/ebb8ed4b-00ff-41bc-8e1d-3dbeeeadfe0a"
    }
  }
}; 