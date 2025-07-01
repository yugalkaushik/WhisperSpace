import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { room = 'general', page = 1, limit = 50 } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const messages = await Message.find({ room })
      .populate('sender', 'username avatar isOnline')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    const totalMessages = await Message.countDocuments({ room });
    const totalPages = Math.ceil(totalMessages / limitNum);

    res.json({
      messages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalMessages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, room = 'general', messageType = 'text' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const message = new Message({
      content: content.trim(),
      sender: req.user._id,
      room,
      messageType
    });

    await message.save();
    
    // Populate sender information
    await message.populate('sender', 'username avatar isOnline');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

export const editMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if ((message.sender as any).toString() !== (req.user?._id as any).toString()) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    // Check if message is not too old (e.g., 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return res.status(403).json({ message: 'Message is too old to edit' });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    await message.populate('sender', 'username avatar isOnline');

    res.json({
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error editing message' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if ((message.sender as any).toString() !== (req.user?._id as any).toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error deleting message' });
  }
};