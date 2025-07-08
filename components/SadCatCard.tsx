/*
SadCatCard component that shows animated sad cat GIF using WebView.
Displays randomly until user sends 10 messages today.
Uses WebView to properly support animated GIFs on all platforms.
*/

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

interface SadCatCardProps {
  sentToday: number;
}

export default function SadCatCard({ sentToday }: SadCatCardProps) {
  const getEncouragementText = () => {
    if (sentToday === 0) {
      return "Time to spread some love! 💕";
    } else if (sentToday < 5) {
      return "Keep the love flowing! 💕";
    } else {
      return "You're doing great! 💕";
    }
  };

  const getSubText = () => {
    if (sentToday === 0) {
      return "Send your first message to brighten someone's day";
    } else if (sentToday < 5) {
      return `${sentToday} messages sent! Why not send a few more?`;
    } else {
      return `${sentToday} messages sent! Almost at your goal of 10!`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {sentToday === 0 ? "No Messages Today" : "Keep Going!"}
      </Text>
      <View style={styles.content}>
        <WebView
          source={{
            html: `
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                  <style>
                    body { 
                      margin: 0; 
                      padding: 0; 
                      background: transparent; 
                      display: flex; 
                      justify-content: center; 
                      align-items: center; 
                      height: 100vh; 
                      overflow: hidden;
                    }
                    img { 
                      max-width: 100%; 
                      max-height: 100%; 
                      object-fit: contain;
                      border: none;
                    }
                  </style>
                </head>
                <body>
                  <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" alt="Sad Cat" />
                </body>
              </html>
            `
          }}
          style={styles.sadCatImage}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scalesPageToFit={false}
          startInLoadingState={false}
          domStorageEnabled={false}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={['*']}
        />
        <Text style={styles.encouragementText}>
          {getEncouragementText()}
        </Text>
        <Text style={styles.subText}>
          {getSubText()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  sadCatImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  encouragementText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FF8C42',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
}); 