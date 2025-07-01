import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IMessage extends Document {
  content: string;
  sender: IUser['_id'];
  receiver?: IUser['_id'];
  room?: string;
  messageType: 'text' | 'emoji' | 'image';
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  room: {
    type: String,
    default: 'general'
  },
  messageType: {
    type: String,
    enum: ['text', 'emoji', 'image'],
    default: 'text'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);