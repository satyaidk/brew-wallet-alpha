"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function APIKeyNotification() {
  const [show, setShow] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if API keys are configured
    const hasApiKeys = process.env.NEXT_PUBLIC_ZAPPER_API_KEY && 
                      process.env.NEXT_PUBLIC_ZAPPER_API_KEY !== "your_zapper_api_key_here";
    
    if (!hasApiKeys) {
      setShow(true);
    }
  }, []);

  if (!isClient || !show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black p-4 rounded-lg shadow-lg max-w-md">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm">API Keys Required</h3>
          <p className="text-xs mt-1">
            To see your token, DeFi, and NFT data, please configure your API keys in the <code>.env.local</code> file.
          </p>
          <a 
            href="/setup" 
            className="text-xs underline mt-2 inline-block"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Setup Instructions
          </a>
        </div>
        <button
          onClick={() => setShow(false)}
          className="flex-shrink-0 hover:bg-yellow-600 rounded p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
