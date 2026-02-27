import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { CLOSING } from 'ws';

interface AuthenticatedWebSocket extends WebSocket {
    userId?: number;
}

export const setupWebSocket = (server: Server) => {
    const wss = new WebSocketServer({ server, path: '/ws' });

    // Connected users map
    const clients = new Map<number, AuthenticatedWebSocket>();

    wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
        try {
            // Extract token from query string
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const token = url.searchParams.get('token');

            if (!token) {
                ws.close(1008, 'Token required');
                return;
            }

            // Verify token (assuming JWT secret is configured)
            const secret = process.env.JWT_SECRET || 'your_super_secret_key'; // fallback matching README
            const decoded = jwt.verify(token, secret) as any;
            ws.userId = decoded.id;

            if (ws.userId) {
                clients.set(ws.userId, ws);
                // console.log(`User ${ws.userId} connected via WS`);
            }

            ws.on('message', async (data) => {
                try {
                    console.log(data);
                    const messageData = JSON.parse(data.toString());
                    const { receiverId, content, serviceRequestId, appointmentId } = messageData;

                    if (!receiverId || !content) return;

                    // Save message to database
                    const message = await prisma.message.create({
                        data: {
                            content,
                            senderId: ws.userId!,
                            receiverId,
                            serviceRequestId,
                            appointmentId
                        },
                        include: {
                            sender: { select: { id: true, firstName: true, lastName: true } }
                        }
                    });

                    // Broadcast to receiver if they are online
                    const receiverWs = clients.get(receiverId);
                    if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
                        receiverWs.send(JSON.stringify({ type: 'NEW_MESSAGE', data: message }));
                    }

                    // Send acknowledgment back to sender
                    ws.send(JSON.stringify({ type: 'MESSAGE_SENT', data: message }));

                } catch (err) {
                    console.error('WS message error:', err);
                    ws.send(JSON.stringify({ type: 'ERROR', message: 'Failed to process message' }));
                }
            });

            ws.on('close', () => {
                if (ws.userId) {
                    clients.delete(ws.userId);
                }
            });
        } catch (err) {
            ws.close(1008, 'Authentication failed');
        }
    });

    return wss;
};
