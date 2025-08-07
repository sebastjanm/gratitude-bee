import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private reconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000; // Start with 1 second

  /**
   * Get or create a channel with automatic reconnection
   */
  getChannel(name: string): RealtimeChannel {
    const existing = this.channels.get(name);
    if (existing && existing.state === 'joined') {
      return existing;
    }

    // Remove old channel if it exists but isn't connected
    if (existing) {
      this.removeChannel(name);
    }

    const channel = supabase.channel(name);
    this.channels.set(name, channel);
    return channel;
  }

  /**
   * Subscribe to a channel with reconnection logic
   */
  async subscribeWithReconnect(
    channel: RealtimeChannel, 
    onConnect?: () => void,
    onDisconnect?: () => void,
    attemptCount = 0
  ): Promise<RealtimeChannel> {
    const channelName = channel.topic;

    channel.subscribe((status) => {
      console.log(`[RealtimeManager] Channel ${channelName} status: ${status}`);

      if (status === 'SUBSCRIBED') {
        // Clear any pending reconnection
        const timeout = this.reconnectTimeouts.get(channelName);
        if (timeout) {
          clearTimeout(timeout);
          this.reconnectTimeouts.delete(channelName);
        }
        
        if (onConnect) onConnect();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        if (onDisconnect) onDisconnect();
        
        // Attempt reconnection
        if (attemptCount < this.maxReconnectAttempts) {
          const delay = this.reconnectDelay * Math.pow(2, attemptCount); // Exponential backoff
          console.log(`[RealtimeManager] Reconnecting ${channelName} in ${delay}ms (attempt ${attemptCount + 1})`);
          
          const timeout = setTimeout(() => {
            this.reconnectChannel(channelName, onConnect, onDisconnect, attemptCount + 1);
          }, delay);
          
          this.reconnectTimeouts.set(channelName, timeout);
        } else {
          console.error(`[RealtimeManager] Failed to reconnect ${channelName} after ${this.maxReconnectAttempts} attempts`);
        }
      }
    });
    
    return channel;
  }

  /**
   * Reconnect a channel
   */
  private async reconnectChannel(
    channelName: string, 
    onConnect?: () => void,
    onDisconnect?: () => void,
    attemptCount = 0
  ) {
    // Remove old channel
    this.removeChannel(channelName);
    
    // Create new channel
    const newChannel = this.getChannel(channelName);
    
    // Resubscribe
    await this.subscribeWithReconnect(newChannel, onConnect, onDisconnect, attemptCount);
  }

  /**
   * Remove a channel and clean up
   */
  removeChannel(name: string) {
    const channel = this.channels.get(name);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(name);
    }

    const timeout = this.reconnectTimeouts.get(name);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(name);
    }
  }

  /**
   * Remove all channels
   */
  removeAllChannels() {
    this.channels.forEach((channel, name) => {
      this.removeChannel(name);
    });
  }

  /**
   * Check connection health
   */
  getConnectionStatus(): { connected: number; disconnected: number; total: number } {
    let connected = 0;
    let disconnected = 0;

    this.channels.forEach(channel => {
      if (channel.state === 'joined') {
        connected++;
      } else {
        disconnected++;
      }
    });

    return {
      connected,
      disconnected,
      total: this.channels.size
    };
  }
}

export const realtimeManager = new RealtimeManager();