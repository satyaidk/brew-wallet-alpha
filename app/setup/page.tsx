"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function SetupPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const envContent = `# Brewit Wallet Environment Variables
# Copy this file and fill in your actual API keys

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
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key_here`;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const apiKeys = [
    {
      name: "WalletConnect Project ID",
      variable: "NEXT_PUBLIC_PROJECT_ID",
      description: "Enables wallet connections through WalletConnect",
      required: true,
      link: "https://cloud.walletconnect.com/",
      instructions: "1. Go to WalletConnect Cloud\n2. Create a new project\n3. Copy the Project ID"
    },
    {
      name: "Zapper API Key",
      variable: "NEXT_PUBLIC_ZAPPER_API_KEY",
      description: "Fetches token, DeFi, and NFT data",
      required: true,
      link: "https://docs.zapper.fi/docs/api-keys",
      instructions: "1. Go to Zapper API\n2. Sign up for an account\n3. Generate an API key"
    },
    {
      name: "Pimlico API Key",
      variable: "NEXT_PUBLIC_PIMLICO_API_KEY",
      description: "Provides bundler services for account abstraction",
      required: true,
      link: "https://pimlico.io/",
      instructions: "1. Go to Pimlico\n2. Sign up for an account\n3. Get your API key from the dashboard"
    },
    {
      name: "Passkey Server URL",
      variable: "NEXT_PUBLIC_PASSKEY_SERVER_URL",
      description: "Handles passkey authentication",
      required: true,
      link: "https://zerodev.app/",
      instructions: "1. Set up a passkey server (ZeroDev or similar)\n2. Use the server URL provided"
    },
    {
      name: "Zenguard API Key",
      variable: "NEXT_PUBLIC_ZENGUARD_API_KEY",
      description: "Job scheduling for automated transactions",
      required: true,
      link: "https://zenguard.xyz/",
      instructions: "1. Contact Zenguard for API access\n2. Get your API key"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Brewit Wallet Setup</h1>
        
        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Create a <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file in your project root</li>
            <li>Copy the environment variables template below</li>
            <li>Fill in your actual API keys</li>
            <li>Restart your development server</li>
          </ol>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Environment Variables Template</h2>
            <button
              onClick={() => copyToClipboard(envContent, 'env')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              {copied === 'env' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied === 'env' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-black p-4 rounded text-sm overflow-x-auto">
            <code>{envContent}</code>
          </pre>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Required API Keys</h2>
          {apiKeys.map((key, index) => (
            <div key={index} className="bg-gray-900 p-6 rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{key.name}</h3>
                  <p className="text-gray-400 mt-1">{key.description}</p>
                  <code className="bg-gray-800 px-2 py-1 rounded text-sm mt-2 inline-block">
                    {key.variable}
                  </code>
                </div>
                <div className="flex gap-2">
                  <a
                    href={key.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Get API Key
                  </a>
                </div>
              </div>
              <div className="bg-black p-4 rounded">
                <h4 className="font-semibold mb-2">Instructions:</h4>
                <pre className="text-sm text-gray-300 whitespace-pre-line">
                  {key.instructions}
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-900 border border-yellow-600 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold mb-2">⚠️ Important Notes</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Never commit your <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file to version control</li>
            <li>Keep your API keys secure and don't share them</li>
            <li>Use different API keys for development and production</li>
            <li>Regularly rotate your API keys for security</li>
          </ul>
        </div>

        <div className="text-center mt-8">
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
          >
            Back to App
          </a>
        </div>
      </div>
    </div>
  );
}
