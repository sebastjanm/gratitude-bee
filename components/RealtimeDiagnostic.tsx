import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius } from '@/utils/design-system';

export default function RealtimeDiagnostic() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [testChannel, setTestChannel] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    console.log(`[Realtime Debug] ${message}`);
  };

  const testRealtimeConnection = async () => {
    addLog('Starting Realtime connection test...');
    
    // Clean up existing channel if any
    if (testChannel) {
      await supabase.removeChannel(testChannel);
      setTestChannel(null);
    }

    // Test 1: Basic channel subscription
    const channel = supabase.channel('test-channel-' + Date.now());
    
    channel
      .on('presence', { event: 'sync' }, () => {
        addLog('✅ Presence sync event received');
      })
      .on('broadcast', { event: 'test' }, (payload) => {
        addLog(`✅ Broadcast received: ${JSON.stringify(payload)}`);
      })
      .subscribe((status) => {
        addLog(`Channel status: ${status}`);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          addLog('✅ Successfully subscribed to channel');
          
          // Send a test broadcast
          channel.send({
            type: 'broadcast',
            event: 'test',
            payload: { message: 'Hello from diagnostic!' }
          });
        } else if (status === 'CHANNEL_ERROR') {
          addLog('❌ Channel error occurred');
          setIsConnected(false);
        } else if (status === 'TIMED_OUT') {
          addLog('❌ Connection timed out');
          setIsConnected(false);
        } else if (status === 'CLOSED') {
          addLog('❌ Channel closed');
          setIsConnected(false);
        }
      });

    setTestChannel(channel);
  };

  const testDatabaseSubscription = async () => {
    addLog('Testing database subscription...');
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      addLog('❌ No authenticated user found');
      return;
    }

    const dbChannel = supabase
      .channel('db-changes-test')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          addLog(`✅ Database change detected: ${payload.eventType}`);
        }
      )
      .subscribe((status) => {
        addLog(`Database channel status: ${status}`);
      });

    // Clean up after 10 seconds
    setTimeout(() => {
      supabase.removeChannel(dbChannel);
      addLog('Database channel removed');
    }, 10000);
  };

  const checkWebSocketConnection = () => {
    // Check if WebSocket is connected
    const channels = supabase.getChannels();
    addLog(`Active channels: ${channels.length}`);
    
    channels.forEach((channel, index) => {
      addLog(`Channel ${index}: ${channel.topic} - ${channel.state}`);
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (testChannel) {
        supabase.removeChannel(testChannel);
      }
    };
  }, [testChannel]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Realtime Diagnostic</Text>
        <View style={[styles.statusIndicator, isConnected ? styles.connected : styles.disconnected]} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testRealtimeConnection}>
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testDatabaseSubscription}>
          <Text style={styles.buttonText}>Test DB Subscribe</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={checkWebSocketConnection}>
          <Text style={styles.buttonText}>Check Channels</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <Text key={index} style={[
            styles.logText,
            log.includes('✅') && styles.successLog,
            log.includes('❌') && styles.errorLog,
          ]}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connected: {
    backgroundColor: Colors.success,
  },
  disconnected: {
    backgroundColor: Colors.error,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  clearButton: {
    backgroundColor: Colors.gray500,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  logContainer: {
    flex: 1,
    backgroundColor: Colors.gray900,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  logText: {
    color: Colors.gray300,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.xs,
  },
  successLog: {
    color: Colors.success,
  },
  errorLog: {
    color: Colors.error,
  },
});