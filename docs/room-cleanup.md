# Room Cleanup System

The WhisperSpace application includes an automated room cleanup system that prevents the database from filling up with empty rooms.

## How it Works

### Automatic Cleanup

- **Trigger**: When the last user leaves a room, the `emptyAt` timestamp is set and the room is marked as inactive
- **Cleanup Interval**: Every 15 minutes, the system checks for empty rooms
- **Deletion Threshold**: Rooms that have been empty for more than 1 hour are automatically deleted
- **Cleanup Scope**: Both the room record and all associated messages are permanently deleted

### Room Lifecycle

1. **Room Created**: User creates a room with a name and PIN
2. **Users Join/Leave**: Room remains active as long as it has members
3. **Room Becomes Empty**: Last user leaves → `emptyAt` timestamp is set, `isActive` = false
4. **Grace Period**: Room remains in database for 1 hour (users can still rejoin)
5. **Automatic Deletion**: After 1 hour of being empty, room and all messages are deleted

### Configuration

- **Cleanup Check Interval**: 15 minutes (configurable in `roomCleanup.ts`)
- **Deletion Threshold**: 1 hour (configurable in `roomCleanup.ts`)
- **Service Location**: `server/src/services/roomCleanup.ts`

## Admin Endpoints

### Get Cleanup Statistics

```bash
GET /api/admin/cleanup/stats
```

Response:

```json
{
  "totalRooms": 6,
  "emptyRooms": 2,
  "roomsToDelete": 0,
  "roomsPendingDeletion": 2
}
```

### Manual Cleanup Trigger

```bash
POST /api/admin/cleanup/manual
```

Response:

```json
{
  "message": "Manual cleanup completed",
  "deletedRooms": 3,
  "errors": []
}
```

## Monitoring

The cleanup service logs all activities:

- `🧹 Starting room cleanup service...` - Service startup
- `✅ Room cleanup service started (checks every X minutes)` - Confirmation
- `🧹 Room cleanup: No rooms to delete` - No action needed
- `🗑️ Deleted room "Room Name" (ROOMCODE)` - Room deletion
- `✅ Room cleanup completed: X rooms deleted` - Cleanup summary
- `❌ Failed to delete room ROOMCODE` - Error handling

## Database Impact

### Before Cleanup System

- Rooms accumulated indefinitely
- Database size grew continuously
- Performance degraded over time

### After Cleanup System

- Only active and recently empty rooms stored
- Consistent database performance
- Automatic space management

## Technical Details

### RoomCleanupService Class Methods

- `start()`: Initialize the cleanup service
- `stop()`: Stop the cleanup service (called on server shutdown)
- `runCleanup()`: Execute the cleanup process
- `manualCleanup()`: Manually trigger cleanup
- `getCleanupStats()`: Get statistics about room cleanup status

### Integration Points

- **Server Startup**: Cleanup service starts automatically
- **Server Shutdown**: Graceful service shutdown
- **Room Controller**: Sets `emptyAt` timestamp when rooms become empty
- **Socket Events**: Triggers room empty check when users leave

## Customization

To modify cleanup behavior, edit `server/src/services/roomCleanup.ts`:

```typescript
// Check every 10 minutes instead of 15
private readonly CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

// Delete after 30 minutes instead of 1 hour
private readonly ROOM_DELETION_THRESHOLD_MS = 30 * 60 * 1000;
```
