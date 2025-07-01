import { Request, Response } from 'express';
import { Room } from '../models/Room';
import bcrypt from 'bcryptjs';

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, pin } = req.body;
    const user = (req as any).user;

    console.log('Create room request:', { name, pin, userId: user?._id });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = user._id.toString();
    console.log('User ID for room creation:', userId);

    if (!name || !pin) {
      return res.status(400).json({ message: 'Room name and PIN are required' });
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    // Generate unique room code
    let roomCode;
    let isUnique = false;
    while (!isUnique) {
      roomCode = (Room as any).generateRoomCode();
      const existingRoom = await Room.findOne({ code: roomCode });
      if (!existingRoom) {
        isUnique = true;
      }
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    // Create room
    const room = new Room({
      name,
      code: roomCode,
      pin: hashedPin,
      creator: userId,
      members: [userId]
    });

    console.log('About to save room:', { name, code: roomCode, creator: userId, members: [userId] });
    await room.save();
    console.log('Room saved successfully:', room._id);

    res.status(201).json({
      message: 'Room created successfully',
      roomCode: room.code,
      roomName: room.name
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { roomCode, pin } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = user._id.toString();

    if (!roomCode || !pin) {
      return res.status(400).json({ message: 'Room code and PIN are required' });
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    // Find room
    const room = await Room.findOne({ code: roomCode.toUpperCase(), isActive: true });
    if (!room) {
      return res.status(404).json({ message: 'Room not found or inactive' });
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, room.pin);
    if (!isPinValid) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }

    // Add user to room if not already a member
    if (!room.members.includes(userId as any)) {
      room.members.push(userId as any);
      await room.save();
    }

    res.json({
      message: 'Successfully joined room',
      roomCode: room.code,
      roomName: room.name
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRoomInfo = async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = user._id.toString();

    const room = await Room.findOne({ code: roomCode.toUpperCase(), isActive: true })
      .populate('creator', 'username')
      .populate('members', 'username');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is a member
    const isMember = room.members.some((member: any) => member._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this room' });
    }

    res.json({
      roomCode: room.code,
      roomName: room.name,
      creator: room.creator,
      members: room.members,
      createdAt: room.createdAt
    });
  } catch (error) {
    console.error('Get room info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const leaveRoom = async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = user._id.toString();

    const room = await Room.findOne({ code: roomCode.toUpperCase(), isActive: true });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Remove user from room
    room.members = room.members.filter((member: any) => member.toString() !== userId);
    
    // If room is empty, mark the time it became empty
    if (room.members.length === 0) {
      room.emptyAt = new Date();
      console.log(`Room ${room.code} is now empty, marked for deletion in 1 hour`);
    }
    
    // If creator left and room is not empty, transfer ownership to first member
    if (room.creator.toString() === userId && room.members.length > 0) {
      room.creator = room.members[0];
      console.log(`Room ${room.code} ownership transferred to ${room.members[0]}`);
    }
    
    // Only deactivate if empty (we'll let the cleanup job delete it later)
    if (room.members.length === 0) {
      room.isActive = false;
    }

    await room.save();

    res.json({ message: 'Successfully left room' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
