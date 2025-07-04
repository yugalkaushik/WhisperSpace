// Simple test script to check if server is running
const fetch = require('node-fetch');

async function testServer() {
  try {
    console.log('Testing server connection...');
    const response = await fetch('http://localhost:3001/api/auth/google');
    console.log('Server response status:', response.status);
    
    if (response.status === 302) {
      console.log('✅ Server is running and Google Auth endpoint is working (redirect)');
      console.log('Redirect location:', response.headers.get('location'));
    } else {
      console.log('❌ Server response:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Server is NOT running or accessible:', error.message);
    console.log('\n💡 To start the server:');
    console.log('   cd server');
    console.log('   npm run dev');
  }
}

testServer();
