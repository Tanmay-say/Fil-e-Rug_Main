import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Wallet, 
  Database, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  HardDrive,
  TrendingUp
} from "lucide-react";
import { useSynapseBalances } from "@/hooks/use-synapse-balances";
import { useSynapsePayment } from "@/hooks/use-synapse-payment";
import { useWallet } from "@/hooks/useWallet";

const SynapseStorageManager: React.FC = () => {
  const { data, isLoading, isError, refetch } = useSynapseBalances();
  const { handlePayment, isLoading: isPaymentLoading } = useSynapsePayment();
  const { isConnected, isCalibnet, tfilBalance, tusdfcBalance } = useWallet();

  const {
    filBalance,
    usdfcBalance,
    pandoraBalance,
    persistenceDaysLeft,
    isSufficient,
    rateNeeded,
    lockUpNeeded,
    depositNeeded,
    storageUsage,
    storageCapacity,
  } = data;

  const handleDeposit = async () => {
    if (!isConnected || !isCalibnet) {
      return;
    }

    const result = await handlePayment({
      lockupAllowance: BigInt(lockUpNeeded),
      epochRateAllowance: BigInt(rateNeeded),
      depositAmount: BigInt(depositNeeded),
    });

    if (result.success) {
      // Refresh balances after successful payment
      refetch();
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Synapse Storage Manager
          </CardTitle>
          <CardDescription>
            Connect your wallet to manage Filecoin storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Please connect your MetaMask wallet to view storage information and manage payments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isCalibnet) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Synapse Storage Manager
          </CardTitle>
          <CardDescription>
            Switch to Calibnet to manage Filecoin storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please switch to Filecoin Calibnet to access Synapse storage features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Synapse Storage Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2">Loading storage data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Synapse Storage Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load storage data. Please try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const storagePercentage = (storageUsage / storageCapacity) * 100;
  const daysColor = persistenceDaysLeft < 10 ? 'text-red-500' : 
                   persistenceDaysLeft < 30 ? 'text-yellow-500' : 'text-green-500';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Synapse Storage Manager
        </CardTitle>
        <CardDescription>
          Monitor balances and manage persistent storage on Filecoin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Balances - Using wallet hook balances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">tFIL Balance</span>
              </div>
              <p className="text-2xl font-bold">{parseFloat(tfilBalance).toFixed(4)} tFIL</p>
              <p className="text-xs text-gray-500">For gas fees</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">tUSDFC Balance</span>
              </div>
              <p className="text-2xl font-bold">{parseFloat(tusdfcBalance).toFixed(2)} tUSDFC</p>
              <p className="text-xs text-gray-500">For storage payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Pandora Balance</span>
              </div>
              <p className="text-2xl font-bold">{pandoraBalance} USDFC</p>
              <p className="text-xs text-gray-500">Locked for storage</p>
            </CardContent>
          </Card>
        </div>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Used: {storageUsage} GB</span>
              <span className="text-sm text-gray-500">Capacity: {storageCapacity} GB</span>
            </div>
            <Progress value={storagePercentage} className="w-full" />
            <div className="flex justify-between items-center text-sm">
              <span>{storagePercentage.toFixed(1)}% used</span>
              <span className={daysColor}>
                {persistenceDaysLeft} days remaining
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Persistence Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Persistence Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSufficient ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {isSufficient ? 'Sufficient Balance' : 'Insufficient Balance'}
                </span>
              </div>
              <Badge variant={isSufficient ? 'default' : 'destructive'}>
                {persistenceDaysLeft} days
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Actions */}
        {!isSufficient && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Extend Storage
              </CardTitle>
              <CardDescription>
                Add more USDFC to extend your storage persistence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Rate Needed:</span>
                  <p className="font-medium">{rateNeeded} USDFC</p>
                </div>
                <div>
                  <span className="text-gray-500">Lockup Needed:</span>
                  <p className="font-medium">{lockUpNeeded} USDFC</p>
                </div>
                <div>
                  <span className="text-gray-500">Deposit Needed:</span>
                  <p className="font-medium">{depositNeeded} USDFC</p>
                </div>
              </div>
              <Button 
                onClick={handleDeposit} 
                disabled={isPaymentLoading}
                className="w-full"
              >
                {isPaymentLoading ? 'Processing...' : 'Deposit USDFC'}
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default SynapseStorageManager; 