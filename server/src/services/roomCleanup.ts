import { Room } from '../models/Room';
import { Message } from '../models/Message';

export class RoomCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS = 15 * 60 * 1000; // Check every 15 minutes
  private readonly ROOM_DELETION_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Start the automatic room cleanup service
   */
  start(): void {
    if (this.cleanupInterval) {
      console.log('Room cleanup service is already running');
      return;
    }

    console.log('🧹 Starting room cleanup service...');
    
    // Run cleanup immediately on start
    this.runCleanup();
    
    // Then run cleanup every 15 minutes
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, this.CLEANUP_INTERVAL_MS);

    console.log(`✅ Room cleanup service started (checks every ${this.CLEANUP_INTERVAL_MS / 1000 / 60} minutes)`);
  }

  /**
   * Stop the automatic room cleanup service
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Room cleanup service stopped');
    }
  }

  /**
   * Run the cleanup process to delete old empty rooms
   */
  private async runCleanup(): Promise<void> {
    try {
      const now = new Date();
      const thresholdTime = new Date(now.getTime() - this.ROOM_DELETION_THRESHOLD_MS);

      // Find rooms that have been empty for more than 1 hour
      const roomsToDelete = await Room.find({
        emptyAt: { $ne: null, $lt: thresholdTime },
        isActive: false
      });

      if (roomsToDelete.length === 0) {
        console.log('🧹 Room cleanup: No rooms to delete');
        return;
      }

      console.log(`🧹 Room cleanup: Found ${roomsToDelete.length} rooms to delete`);

      for (const room of roomsToDelete) {
        try {
          // Delete all messages in the room
          const deletedMessages = await Message.deleteMany({ room: room._id });
          
          // Delete the room
          await Room.findByIdAndDelete(room._id);

          console.log(`🗑️  Deleted room "${room.name}" (${room.code}) - was empty since ${room.emptyAt}, deleted ${deletedMessages.deletedCount} messages`);
        } catch (error) {
          console.error(`❌ Failed to delete room ${room.code}:`, error);
        }
      }

      console.log(`✅ Room cleanup completed: ${roomsToDelete.length} rooms deleted`);
    } catch (error) {
      console.error('❌ Room cleanup error:', error);
    }
  }

  /**
   * Manually trigger cleanup (useful for testing or admin operations)
   */
  async manualCleanup(): Promise<{ deletedRooms: number; errors: string[] }> {
    console.log('🧹 Manual room cleanup triggered');
    
    const result = {
      deletedRooms: 0,
      errors: [] as string[]
    };

    try {
      const now = new Date();
      const thresholdTime = new Date(now.getTime() - this.ROOM_DELETION_THRESHOLD_MS);

      const roomsToDelete = await Room.find({
        emptyAt: { $ne: null, $lt: thresholdTime },
        isActive: false
      });

      for (const room of roomsToDelete) {
        try {
          await Message.deleteMany({ room: room._id });
          await Room.findByIdAndDelete(room._id);
          result.deletedRooms++;
          console.log(`🗑️  Manually deleted room "${room.name}" (${room.code})`);
        } catch (error) {
          const errorMsg = `Failed to delete room ${room.code}: ${error}`;
          result.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }
    } catch (error) {
      const errorMsg = `Manual cleanup failed: ${error}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }

    return result;
  }

  /**
   * Get statistics about rooms that will be cleaned up
   */
  async getCleanupStats(): Promise<{
    totalRooms: number;
    emptyRooms: number;
    roomsToDelete: number;
    roomsPendingDeletion: number;
  }> {
    const now = new Date();
    const thresholdTime = new Date(now.getTime() - this.ROOM_DELETION_THRESHOLD_MS);

    const [totalRooms, emptyRooms, roomsToDelete, roomsPendingDeletion] = await Promise.all([
      Room.countDocuments({}),
      Room.countDocuments({ emptyAt: { $ne: null } }),
      Room.countDocuments({
        emptyAt: { $ne: null, $lt: thresholdTime },
        isActive: false
      }),
      Room.countDocuments({
        emptyAt: { $ne: null, $gte: thresholdTime },
        isActive: false
      })
    ]);

    return {
      totalRooms,
      emptyRooms,
      roomsToDelete,
      roomsPendingDeletion
    };
  }
}

// Export a singleton instance
export const roomCleanupService = new RoomCleanupService();
