"use client"

import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export function useSocket(url: string, onMessage?: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(url, {
      transports: ["websocket", "polling"],
    })

    const socket = socketRef.current

    // Connection event
    socket.on("connect", () => {
      console.log("Connected to WebSocket server")
    })

    // Disconnection event
    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server")
    })

    // Custom message event
    socket.on("project-update", (data) => {
      console.log("Project update received:", data)
      onMessage?.(data)
    })

    socket.on("task-update", (data) => {
      console.log("Task update received:", data)
      onMessage?.(data)
    })

    socket.on("requirement-update", (data) => {
      console.log("Requirement update received:", data)
      onMessage?.(data)
    })

    socket.on("notification", (data) => {
      console.log("Notification received:", data)
      onMessage?.(data)
    })

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [url, onMessage])

  const emit = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }

  return { emit }
}