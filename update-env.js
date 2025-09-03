const fs = require('fs');
const path = require('path');

// Read the current .env.local file
const envPath = path.join(__dirname, '.env.local');

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update the passkey server URL
  envContent = envContent.replace(
    'NEXT_PUBLIC_PASSKEY_SERVER_URL=your_passkey_server_url_here',
    'NEXT_PUBLIC_PASSKEY_SERVER_URL=http://localhost:3000'
  );
  
  // Write the updated content back
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Updated .env.local with passkey server URL');
  console.log('📡 Passkey server URL set to: http://localhost:3000');
  
} catch (error) {
  console.error('❌ Error updating .env.local:', error.message);
  console.log('\n📝 Please manually update your .env.local file:');
  console.log('Change: NEXT_PUBLIC_PASSKEY_SERVER_URL=your_passkey_server_url_here');
  console.log('To:     NEXT_PUBLIC_PASSKEY_SERVER_URL=http://localhost:3000');
}
