# Brewit Wallet - Setup Instructions

## Overview
Brewit Wallet is a Web3 wallet application that uses passkey authentication and account abstraction for seamless crypto management across multiple chains.

## Required API Keys

To make this application work properly, you need to set up the following API keys in your `.env.local` file:

### 1. WalletConnect Project ID (Required)
- **Variable**: `NEXT_PUBLIC_PROJECT_ID`
- **Purpose**: Enables wallet connections through WalletConnect
- **How to get**: 
  1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
  2. Create a new project
  3. Copy the Project ID

### 2. Zapper API Key (Required)
- **Variable**: `NEXT_PUBLIC_ZAPPER_API_KEY`
- **Purpose**: Fetches token, DeFi, and NFT data
- **How to get**:
  1. Go to [Zapper API](https://docs.zapper.fi/docs/api-keys)
  2. Sign up for an account
  3. Generate an API key

### 3. Pimlico API Key (Required)
- **Variable**: `NEXT_PUBLIC_PIMLICO_API_KEY`
- **Purpose**: Provides bundler services for account abstraction
- **How to get**:
  1. Go to [Pimlico](https://pimlico.io/)
  2. Sign up for an account
  3. Get your API key from the dashboard

### 4. Passkey Server URL (Required)
- **Variable**: `NEXT_PUBLIC_PASSKEY_SERVER_URL`
- **Purpose**: Handles passkey authentication
- **How to get**:
  1. Set up a passkey server (ZeroDev or similar)
  2. Use the server URL provided

### 5. Zenguard API Key (Required)
- **Variable**: `NEXT_PUBLIC_ZENGUARD_API_KEY`
- **Purpose**: Job scheduling for automated transactions
- **How to get**:
  1. Contact Zenguard for API access
  2. Get your API key

### 6. Alchemy API Keys (Optional but Recommended)
- **Variables**: 
  - `NEXT_PUBLIC_ALCHEMY_API_KEY_ETHEREUM`
  - `NEXT_PUBLIC_ALCHEMY_API_KEY_BASE`
- **Purpose**: Better RPC performance
- **How to get**:
  1. Go to [Alchemy](https://www.alchemy.com/)
  2. Create an account
  3. Create apps for Ethereum and Base networks
  4. Copy the API keys

### 7. Infura API Key (Optional)
- **Variable**: `NEXT_PUBLIC_INFURA_API_KEY`
- **Purpose**: Backup RPC provider
- **How to get**:
  1. Go to [Infura](https://infura.io/)
  2. Create an account
  3. Create a new project
  4. Copy the API key

## Environment File Setup

Create a `.env.local` file in the root directory with the following structure:

```env
# WalletConnect Project ID (Required for wallet connections)
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id_here

# Zapper API Key (Required for token/DeFi/NFT data)
NEXT_PUBLIC_ZAPPER_API_KEY=your_zapper_api_key_here

# Pimlico API Key (Required for bundler services)
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key_here

# Passkey Server URL (Required for passkey authentication)
NEXT_PUBLIC_PASSKEY_SERVER_URL=your_passkey_server_url_here

# Zenguard API Key (Required for job scheduling)
NEXT_PUBLIC_ZENGUARD_API_KEY=your_zenguard_api_key_here

# Alchemy API Keys (Optional - for better RPC performance)
NEXT_PUBLIC_ALCHEMY_API_KEY_ETHEREUM=your_alchemy_ethereum_key_here
NEXT_PUBLIC_ALCHEMY_API_KEY_BASE=your_alchemy_base_key_here

# Infura API Key (Optional - backup RPC provider)
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key_here
```

## Installation and Setup

1. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Create environment file**:
   - Copy the `.env.local` template above
   - Fill in all the required API keys

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**:
   - Navigate to `http://localhost:3000`

## Features Fixed

### Login Issues Resolved:
- ✅ Fixed typo in environment variable name (`NEXT_PIVATE_ZAPPER_API_KEY` → `NEXT_PUBLIC_ZAPPER_API_KEY`)
- ✅ Added proper error handling for login and account creation
- ✅ Improved loading states and user feedback
- ✅ Added error display for failed authentication attempts
- ✅ Optimized login flow performance

### Application Issues Resolved:
- ✅ Added ZapperProvider to the layout for proper data fetching
- ✅ Enhanced API error handling with proper status codes
- ✅ Added validation for required parameters
- ✅ Improved error logging and debugging

### Performance Improvements:
- ✅ Added try-catch blocks to prevent crashes
- ✅ Optimized useEffect dependencies
- ✅ Better error boundaries and fallbacks

## Troubleshooting

### Common Issues:

1. **"Zapper API key not configured" error**:
   - Make sure `NEXT_PUBLIC_ZAPPER_API_KEY` is set in your `.env.local` file
   - Restart your development server after adding the key

2. **Login not working**:
   - Check that `NEXT_PUBLIC_PASSKEY_SERVER_URL` is correctly configured
   - Ensure your passkey server is running and accessible

3. **Wallet connection issues**:
   - Verify `NEXT_PUBLIC_PROJECT_ID` is correct
   - Check WalletConnect project settings

4. **Slow loading**:
   - Add Alchemy API keys for better RPC performance
   - Check network connectivity

### Getting Help:

If you encounter issues:
1. Check the browser console for error messages
2. Verify all required environment variables are set
3. Ensure all API keys are valid and active
4. Check the network tab for failed API requests

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your API keys secure and don't share them
- Use different API keys for development and production
- Regularly rotate your API keys for security

## Next Steps

After setting up the environment variables:
1. Test the login functionality
2. Verify token data is loading correctly
3. Check DeFi and NFT data fetching
4. Test wallet connections and transactions
