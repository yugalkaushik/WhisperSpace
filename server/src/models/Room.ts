import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  name: string;
  code: string;
  pin: string;
  creator: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  isActive: boolean;
  emptyAt?: Date; // Track when the room became empty
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 8
  },
  pin: {
    type: String,
    required: true,
    length: 4
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  emptyAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate unique room code
roomSchema.statics.generateRoomCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const Room = mongoose.model<IRoom>('Room', roomSchema);
