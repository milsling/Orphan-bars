import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBars } from "@/context/BarContext";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { currentUser } = useBars();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!currentUser) return;
    if (typeof window === "undefined" || !window.WebSocket) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      options.onConnect?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        
        if (data.type === "batchMessages") {
          data.messages.forEach((msg: WebSocketMessage) => {
            handleMessage(msg);
          });
        } else {
          handleMessage(data);
        }
        
        options.onMessage?.(data);
      } catch (error) {
        console.error("WebSocket message parse error:", error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      options.onDisconnect?.();
      
      if (currentUser) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;
  }, [currentUser, options]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case "newMessage":
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        break;
      case "typing":
        break;
      default:
        break;
    }
  }, [queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const sendTyping = useCallback((receiverId: string) => {
    send({ type: "typing", receiverId });
  }, [send]);

  useEffect(() => {
    if (currentUser) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [currentUser, connect, disconnect]);

  return {
    isConnected,
    send,
    sendTyping,
    disconnect,
  };
}
