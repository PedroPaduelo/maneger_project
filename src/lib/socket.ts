import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join project-specific rooms
    socket.on('join-project', (projectId: string) => {
      socket.join(`project-${projectId}`);
      console.log(`Client ${socket.id} joined project ${projectId}`);
    });

    // Leave project-specific rooms
    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project-${projectId}`);
      console.log(`Client ${socket.id} left project ${projectId}`);
    });

    // Handle project updates
    socket.on('project-update', (data: { type: string; project: any; projectName?: string }) => {
      // Broadcast to all clients in the project room
      if (data.project?.id) {
        io.to(`project-${data.project.id}`).emit('project-update', data);
      }
      // Also broadcast to general channel
      io.emit('project-update', data);
    });

    // Handle task updates
    socket.on('task-update', (data: { type: string; task: any }) => {
      // Broadcast to all clients in the project room
      if (data.task?.projectId) {
        io.to(`project-${data.task.projectId}`).emit('task-update', data);
      }
      // Also broadcast to general channel
      io.emit('task-update', data);
    });

    // Handle requirement updates
    socket.on('requirement-update', (data: { type: string; requirement: any }) => {
      // Broadcast to all clients in the project room
      if (data.requirement?.projectId) {
        io.to(`project-${data.requirement.projectId}`).emit('requirement-update', data);
      }
      // Also broadcast to general channel
      io.emit('requirement-update', data);
    });

    // Handle notifications
    socket.on('notification', (data: any) => {
      // Broadcast to all clients
      io.emit('notification', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to Real-time Project Management Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};