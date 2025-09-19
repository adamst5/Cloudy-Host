import { type Bot } from "@shared/schema";

const API_BASE = '/api';

interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

// Helper function for making API requests
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Bot API functions
export const botApi = {
  // Get all bots
  async getAllBots(): Promise<Bot[]> {
    return apiRequest<Bot[]>('/bots');
  },

  // Upload new bot
  async uploadBot(file: File, botName: string, mainFile: string): Promise<ApiResponse<Bot>> {
    const formData = new FormData();
    formData.append('zipFile', file);
    formData.append('botName', botName);
    formData.append('mainFile', mainFile);

    const response = await fetch(`${API_BASE}/bots/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  // Start bot
  async startBot(botId: string): Promise<ApiResponse> {
    return apiRequest(`/bots/${botId}/start`, {
      method: 'POST',
    });
  },

  // Stop bot
  async stopBot(botId: string): Promise<ApiResponse> {
    return apiRequest(`/bots/${botId}/stop`, {
      method: 'POST',
    });
  },

  // Delete bot
  async deleteBot(botId: string): Promise<ApiResponse> {
    return apiRequest(`/bots/${botId}`, {
      method: 'DELETE',
    });
  },

  // Get bot logs
  async getBotLogs(botId: string): Promise<LogEntry[]> {
    return apiRequest<LogEntry[]>(`/bots/${botId}/logs`);
  },

  // Clear bot logs
  async clearBotLogs(botId: string): Promise<ApiResponse> {
    return apiRequest(`/bots/${botId}/logs`, {
      method: 'DELETE',
    });
  },
};

// WebSocket connection for real-time logs (simplified for now)
export class LogsWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, (log: LogEntry) => void> = new Map();

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.ws = new WebSocket(`${protocol}//${location.host}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected for logs');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'log' && data.botId && data.log) {
            const listener = this.listeners.get(data.botId);
            if (listener) {
              listener(data.log);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...');
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      // Fallback to polling if WebSocket fails
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(botId: string, callback: (log: LogEntry) => void) {
    this.listeners.set(botId, callback);
    this.connect();
  }

  unsubscribe(botId: string) {
    this.listeners.delete(botId);
    if (this.listeners.size === 0) {
      this.disconnect();
    }
  }
}

export const logsWebSocket = new LogsWebSocket();