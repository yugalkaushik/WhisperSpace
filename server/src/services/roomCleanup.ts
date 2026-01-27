import { Room } from '../models/Room';

export class RoomCleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes
  private readonly EMPTY_ROOM_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes for empty rooms
  private readonly INACTIVE_ROOM_THRESHOLD_MS = 12 * 60 * 60 * 1000; // 12 hours for rooms with members but no messages

  /**
   * Start the automatic room cleanup service
   */
  start(): void {
    if (this.cleanupInterval) {
      // Room cleanup service already running
      return;
    }

    console.log('🧹 Starting room cleanup service...');
    
    // Run cleanup immediately on start
    this.runCleanup();
    
    // Then run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, this.CLEANUP_INTERVAL_MS);

    console.log(`✅ Room cleanup service started (empty rooms: 10min, inactive rooms: 12hrs)`);
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
   * Run the cleanup process to delete old inactive rooms
   */
  private async runCleanup(): Promise<void> {
    try {
      console.log('🧹 Running room cleanup check...');
      
      const now = new Date();
      const emptyRoomThreshold = new Date(now.getTime() - this.EMPTY_ROOM_THRESHOLD_MS);
      const inactiveRoomThreshold = new Date(now.getTime() - this.INACTIVE_ROOM_THRESHOLD_MS);

      // Find rooms to delete based on two criteria:
      // 1. Empty rooms (no members) - delete after 10 minutes
      // 2. Inactive rooms (has members but no messages) - delete after 12 hours
      const roomsToDelete = await Room.find({
        $or: [
          // Empty rooms - no members for 10 minutes
          {
            members: { $size: 0 },
            $or: [
              { lastMessageAt: { $lt: emptyRoomThreshold } },
              { lastMessageAt: { $exists: false }, createdAt: { $lt: emptyRoomThreshold } }
            ]
          },
          // Inactive rooms - has members but no messages for 12 hours
          {
            members: { $exists: true, $not: { $size: 0 } },
            $or: [
              { lastMessageAt: { $lt: inactiveRoomThreshold } },
              { lastMessageAt: { $exists: false }, createdAt: { $lt: inactiveRoomThreshold } }
            ]
          },
          // Legacy: rooms marked as empty
          {
            emptyAt: { $ne: null, $lt: emptyRoomThreshold },
            isActive: false
          }
        ]
      });

      // Also check all rooms for debugging
      const allRooms = await Room.find({});
      console.log(`📊 Room status: ${allRooms.length} total rooms, ${roomsToDelete.length} to delete`);
      
      allRooms.forEach(room => {
        const lastActivity = room.lastMessageAt || room.createdAt;
        const timeSinceActivity = now.getTime() - lastActivity.getTime();
        const minutesSinceActivity = Math.floor(timeSinceActivity / (1000 * 60));
        const memberCount = room.members?.length || 0;
        console.log(`📋 Room ${room.code} (${room.name}): ${memberCount} members, last activity ${minutesSinceActivity}min ago`);
      });

      if (roomsToDelete.length === 0) {
        console.log('✅ No rooms to delete');
        return;
      }

      console.log(`🧹 Room cleanup: Found ${roomsToDelete.length} rooms to delete`);

      for (const room of roomsToDelete) {
        try {
          // Delete the room
          await Room.findByIdAndDelete(room._id);

          const lastActivity = room.lastMessageAt || room.createdAt;
          console.log(`🗑️  Deleted room "${room.name}" (${room.code}) - last activity: ${lastActivity}`);
        } catch (error) {
          console.error(`Error: Failed to delete room ${room.code}:`, error);
        }
      }

      console.log(`✅ Room cleanup completed: ${roomsToDelete.length} rooms deleted`);
    } catch (error) {
      console.error('Error: Room cleanup error:', error);
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
      const emptyRoomThreshold = new Date(now.getTime() - this.EMPTY_ROOM_THRESHOLD_MS);
      const inactiveRoomThreshold = new Date(now.getTime() - this.INACTIVE_ROOM_THRESHOLD_MS);

      const roomsToDelete = await Room.find({
        $or: [
          {
            members: { $size: 0 },
            $or: [
              { lastMessageAt: { $lt: emptyRoomThreshold } },
              { lastMessageAt: { $exists: false }, createdAt: { $lt: emptyRoomThreshold } }
            ]
          },
          {
            members: { $exists: true, $not: { $size: 0 } },
            $or: [
              { lastMessageAt: { $lt: inactiveRoomThreshold } },
              { lastMessageAt: { $exists: false }, createdAt: { $lt: inactiveRoomThreshold } }
            ]
          },
          {
            emptyAt: { $ne: null, $lt: emptyRoomThreshold },
            isActive: false
          }
        ]
      });

      for (const room of roomsToDelete) {
        try {
          // Messages are ephemeral, no need to delete them
          await Room.findByIdAndDelete(room._id);
          result.deletedRooms++;
          console.log(`🗑️  Manually deleted room "${room.name}" (${room.code})`);
        } catch (error) {
          const errorMsg = `Failed to delete room ${room.code}: ${error}`;
          result.errors.push(errorMsg);
          console.error(`Error: ${errorMsg}`);
        }
      }
    } catch (error) {
      const errorMsg = `Manual cleanup failed: ${error}`;
      result.errors.push(errorMsg);
      console.error(`Error: ${errorMsg}`);
    }

    return result;
  }

  /**
   * Get statistics about rooms that will be cleaned up
   */
  async getCleanupStats(): Promise<{
    totalRooms: number;
    emptyRooms: number;
    inactiveRooms: number;
    roomsToDelete: number;
  }> {
    const now = new Date();
    const emptyRoomThreshold = new Date(now.getTime() - this.EMPTY_ROOM_THRESHOLD_MS);
    const inactiveRoomThreshold = new Date(now.getTime() - this.INACTIVE_ROOM_THRESHOLD_MS);

    const [totalRooms, emptyRooms, inactiveRooms, roomsToDelete] = await Promise.all([
      Room.countDocuments({}),
      Room.countDocuments({ members: { $size: 0 } }),
      Room.countDocuments({
        members: { $exists: true, $not: { $size: 0 } },
        $or: [
          { lastMessageAt: { $lt: inactiveRoomThreshold } },
          { lastMessageAt: { $exists: false }, createdAt: { $lt: inactiveRoomThreshold } }
        ]
      }),
      Room.countDocuments({
        $or: [
          {
            members: { $size: 0 },
            $or: [
              { lastMessageAt: { $lt: emptyRoomThreshold } },
              { lastMessageAt: { $exists: false }, createdAt: { $lt: emptyRoomThreshold } }
            ]
          },
          {
            members: { $exists: true, $not: { $size: 0 } },
            $or: [
              { lastMessageAt: { $lt: inactiveRoomThreshold } },
              { lastMessageAt: { $exists: false }, createdAt: { $lt: inactiveRoomThreshold } }
            ]
          },
          {
            emptyAt: { $ne: null, $lt: emptyRoomThreshold },
            isActive: false
          }
        ]
      })
    ]);

    return {
      totalRooms,
      emptyRooms,
      inactiveRooms,
      roomsToDelete
    };
  }
}

// Export a singleton instance
export const roomCleanupService = new RoomCleanupService();
