import { useAccount, useChainId, useSwitchChain, useConnect, useDisconnect, useBalance } from 'wagmi';
import { filecoinCalibnet } from '@/lib/wagmi-config';
import { useState, useEffect } from 'react';
import { synapseConfig } from '@/lib/synapse-config';

export function useWallet() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Get tFIL balance - only fetch when on Calibnet
  const { data: tfilBalance, refetch: refetchTfil } = useBalance({
    address,
    chainId: filecoinCalibnet.id,
    watch: true, // Auto-refresh when balance changes
    enabled: isConnected && chainId === filecoinCalibnet.id,
  });

  // Get tUSDFC balance - only fetch when on Calibnet
  const { data: tusdfcBalance, refetch: refetchTusdfc } = useBalance({
    address,
    chainId: filecoinCalibnet.id,
    token: synapseConfig.contracts.usdfc,
    watch: true, // Auto-refresh when balance changes
    enabled: isConnected && chainId === filecoinCalibnet.id,
  });

  // Auto-refresh balances when network changes to Calibnet
  useEffect(() => {
    if (isConnected && chainId === filecoinCalibnet.id) {
      refetchTfil();
      refetchTusdfc();
    }
  }, [isConnected, chainId, refetchTfil, refetchTusdfc]);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Debug: Log available connectors
      console.log('Available connectors:', connectors);
      
      const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
      console.log('MetaMask connector found:', metaMaskConnector);
      
      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector });
      } else {
        // Check if MetaMask is available in window object
        if (typeof window !== 'undefined' && window.ethereum) {
          console.log('MetaMask detected in window.ethereum');
          // Try to connect using the first available connector
          if (connectors.length > 0) {
            await connect({ connector: connectors[0] });
          } else {
            throw new Error('No connectors available. Please check your wallet configuration.');
          }
        } else {
          throw new Error('MetaMask not found. Please install MetaMask extension and refresh the page.');
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToCalibnet = async () => {
    try {
      await switchChain({ chainId: filecoinCalibnet.id });
      // Refresh balances after switching
      setTimeout(() => {
        refetchTfil();
        refetchTusdfc();
      }, 1000);
    } catch (error) {
      console.error("Failed to switch to Calibnet:", error);
      throw error;
    }
  };

  const refreshBalances = () => {
    if (isConnected && chainId === filecoinCalibnet.id) {
      refetchTfil();
      refetchTusdfc();
    }
  };

  return { 
    provider: connector?.client,
    address, 
    chainId: chainId?.toString(), 
    connect: connectWallet,
    disconnect,
    switchToCalibnet,
    refreshBalances,
    isConnecting,
    isConnected,
    isCalibnet: chainId === filecoinCalibnet.id,
    tfilBalance: tfilBalance?.formatted || '0',
    tusdfcBalance: tusdfcBalance?.formatted || '0',
    hasEnoughBalance: () => {
      const tfil = parseFloat(tfilBalance?.formatted || '0');
      const tusdfc = parseFloat(tusdfcBalance?.formatted || '0');
      return tfil > 0.01 && tusdfc > 0.1; // Minimum required balances
    }
  };
} 