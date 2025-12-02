# WhisperSpace

A modern, real-time chat platform where conversations come alive. Create rooms, connect with others, and communicate seamlessly with instant messaging powered by WebSocket technology.

## Features

- Real-time messaging with Socket.IO
- Email and Google OAuth authentication
- Room creation and management
- User profiles with avatar customization
- Typing indicators and presence tracking

## Local Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yugalkaushik/WhisperSpace.git
cd WhisperSpace
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables:
- Copy `.env.example` to `.env` in the server directory
- Update the variables with your configuration

4. Run the application:
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

## Documentation

For detailed documentation, see the [docs](./docs) folder.

## Made By

[yugalkaushik](https://github.com/yugalkaushik)

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
