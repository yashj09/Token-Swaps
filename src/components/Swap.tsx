import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import SwingSDK, {
  TransferStepResults,
  TransferStepResult,
  TransferRoute,
  TransferParams,
  Chain,
  Token,
  ChainSlug,
  TokenSymbol,
} from "@swing.xyz/sdk";
import { Button } from "@/ui/Button";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { useToast } from "@/ui/use-toast";
import { LiaExchangeAltSolid } from "react-icons/lia";
import { StatusSheet } from "@/ui/StatusSheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

const Swap: React.FC = () => {
  // State variables for managing the swap process
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<TransferRoute[] | null>(null);
  const [status, setStatus] = useState<TransferStepResult | null>(null);
  const [results, setResults] = useState<TransferStepResults | null>(null);
  const [resultLogs, setResultLogs] = useState<
    { time: string; log?: string; logType?: string }[]
  >([]);

  // Initial transfer parameters
  const [transferParams, setTransferParams] = useState<TransferParams>({
    amount: "0",
    fromChain: "ethereum",
    fromToken: "ETH",
    fromUserAddress: "",
    toChain: "polygon",
    toToken: "MATIC",
    toUserAddress: "",
  });

  const [transferRoute, setTransferRoute] = useState<TransferRoute | null>(
    null
  );
  const [availableChains, setAvailableChains] = useState<Chain[]>([]);
  const [fromTokens, setFromTokens] = useState<Token[]>([]);
  const [toTokens, setToTokens] = useState<Token[]>([]);
  const [balance, setBalance] = useState<string>("0");

  // Web3React hooks for wallet connection
  const { connector, provider, account } = useWeb3React();
  const { toast } = useToast();
  const [swingSDK, setSwingSDK] = useState<SwingSDK | null>(null);
  const isConnected = swingSDK?.wallet.isConnected();

  // Initialize Swing SDK
  useEffect(() => {
    const swing = new SwingSDK({
      projectId: "replug", // Replace with your project ID from https://platform.swing.xyz
      environment: "production",
      debug: true,
    });

    setIsLoading(true);

    swing
      .init()
      .then(() => {
        setIsLoading(false);
        setSwingSDK(swing);
        setAvailableChains(swing.chains);
        updateFromTokens(swing, transferParams.fromChain);
        updateToTokens(swing, transferParams.toChain);
      })
      .catch((error) => {
        setIsLoading(false);
        showError(error.message);
        setSwingSDK(swing);
      });
  }, []);

  // Sync provider with Swing SDK when wallet is connected
  useEffect(() => {
    async function syncProviderWithSwingSDK() {
      if (swingSDK && provider && account) {
        const walletAddress = await swingSDK.wallet.connect(
          provider.getSigner(),
          transferParams.fromChain as ChainSlug
        );

        setTransferParams((prev) => ({
          ...prev,
          fromUserAddress: walletAddress,
          toUserAddress: walletAddress,
        }));

        updateBalance();
      }
    }

    syncProviderWithSwingSDK();
  }, [
    provider,
    swingSDK,
    account,
    transferParams.fromChain,
    transferParams.fromToken,
  ]);

  // Update available tokens for the 'from' chain
  const updateFromTokens = (sdk: SwingSDK, chainSlug: ChainSlug) => {
    const tokens = sdk.getTokensForChain(chainSlug);
    setFromTokens(tokens);
  };

  // Update available tokens for the 'to' chain
  const updateToTokens = (sdk: SwingSDK, chainSlug: ChainSlug) => {
    const tokens = sdk.getTokensForChain(chainSlug);
    setToTokens(tokens);
  };

  // Update user's balance for the selected 'from' token
  const updateBalance = async () => {
    if (swingSDK && account) {
      const balance = await swingSDK.wallet.getBalance(
        transferParams.fromChain as ChainSlug,
        transferParams.fromToken as TokenSymbol,
        account
      );
      setBalance(balance);
    }
  };

  // Display error messages using toast
  const showError = (description: string) => {
    toast({
      title: "An Error Occurred",
      variant: "destructive",
      description,
    });
  };

  // Connect wallet using Web3React
  const connectWallet = async () => {
    if (!swingSDK) return;

    try {
      await connector.activate();
    } catch (error) {
      console.error("Connect Wallet Error:", error);
      showError((error as Error).message);
    }
  };

  // Switch blockchain network
  const switchChain = async (chain: Chain) => {
    if (!swingSDK) return;

    try {
      await connector.activate(chain.id);
    } catch (error) {
      console.error("Switch Chain Error:", error);
      showError((error as Error).message);
    }
  };

  // Get quote for the swap
  const getQuote = async () => {
    if (!swingSDK) return;

    setIsLoading(true);

    try {
      const quotes = await swingSDK.getQuote(transferParams);

      if (!quotes.routes.length) {
        showError("No routes available. Try a different token pair.");
        setIsLoading(false);
        return;
      }

      setRoutes(quotes.routes);
      // Automatically select the best route (first one)
      setTransferRoute(quotes.routes[0]);
    } catch (error) {
      console.error("Quote Error:", error);
      showError((error as Error).message);
    }

    setIsLoading(false);
  };

  // Start the transfer process
  const startTransfer = async () => {
    if (!swingSDK || !transferRoute) {
      showError("No route selected.");
      return;
    }

    if (parseFloat(transferParams.amount) > parseFloat(balance)) {
      showError("Insufficient balance.");
      return;
    }

    // Set up event listener for transfer status updates
    const transferListener = swingSDK.on(
      "TRANSFER",
      async (transferStepStatus, transferResults) => {
        setResultLogs((prevItems) => [
          ...prevItems,
          {
            time: new Date().toISOString(),
            log: `Transaction Status -> ${transferStepStatus.status}`,
            logType: "MESSAGE",
          },
          {
            time: new Date().toISOString(),
            log: `Transfer Step -> ${transferStepStatus.step}`,
            logType: "MESSAGE",
          },
        ]);

        setStatus(transferStepStatus);
        setResults(transferResults);

        console.log("TRANSFER:", transferStepStatus, transferResults);

        // Handle different transfer statuses
        switch (transferStepStatus.status) {
          case "ACTION_REQUIRED":
            setResultLogs((prevItems) => [
              ...prevItems,
              {
                time: new Date().toISOString(),
                log: `ACTION REQUIRED: Prompting MetaMask`,
                logType: "ACTION_REQUIRED",
              },
            ]);
            break;
          case "CHAIN_SWITCH_REQUIRED":
            setResultLogs((prevItems) => [
              ...prevItems,
              {
                time: new Date().toISOString(),
                log: `CHAIN SWITCH REQUIRED: Prompting MetaMask`,
                logType: "CHAIN_SWITCH",
              },
            ]);
            await switchChain(transferStepStatus.chain);
            break;

          case "WALLET_CONNECTION_REQUIRED":
            await connectWallet();
            break;
        }
      }
    );

    setIsLoading(true);

    try {
      await swingSDK.transfer(transferRoute, transferParams);
    } catch (error) {
      console.error("Transfer Error:", error);
      setResultLogs((prevItems) => [
        ...prevItems,
        {
          time: new Date().toISOString(),
          log: `Error -> ${(error as Error).message}`,
          logType: "ERROR",
        },
      ]);
    }

    transferListener();
    setIsLoading(false);
  };

  // Render the Swap component UI
  return (
    <>
      <div className="flex flex-col w-full justify-end ">
        <div className="flex justify-end mr-8">
         <Button className="bg-black hover:bg-gray-800 hover:text-white text whitespace-normal" variant="outline"><a href="https://github.com/yashj09/Token-Swaps">Github Repo</a></Button> 
        </div>
        <Card className="w-full max-w-md mx-auto p-4 bg-black rounded-none shadow-lg border-gray-800">
          <CardHeader className="mb-4">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Swap Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* From Chain and Token selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="from-token"
                  className="block text-sm font-medium text-gray-300"
                >
                  From Chain
                </Label>
                <Select
                  value={transferParams.fromChain}
                  onValueChange={(value) => {
                    setTransferParams((prev) => ({
                      ...prev,
                      fromChain: value as ChainSlug,
                    }));
                    updateFromTokens(swingSDK!, value as ChainSlug);
                  }}
                >
                  <SelectTrigger className="w-full bg-black text-white rounded-none shadow-lg border-gray-800">
                    <SelectValue placeholder="From Chain" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white ">
                    {availableChains.map((chain) => (
                      <SelectItem key={chain.slug} value={chain.slug}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="from-symbol"
                  className="block text-sm font-medium text-gray-300"
                >
                  Token
                </Label>
                <Select
                  value={transferParams.fromToken}
                  onValueChange={(value) => {
                    setTransferParams((prev) => ({
                      ...prev,
                      fromToken: value as TokenSymbol,
                    }));
                    updateBalance();
                  }}
                >
                  <SelectTrigger className="w-full bg-black text-white rounded-none shadow-lg border-gray-800">
                    <SelectValue placeholder="From Token" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    {fromTokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-center my-4">
              <LiaExchangeAltSolid className="text-3xl text-gray-400 transform rotate-90" />
            </div>

            {/* To Chain and Token selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="to-token"
                  className="block text-sm font-medium text-gray-300"
                >
                  To Chain
                </Label>
                <Select
                  value={transferParams.toChain}
                  onValueChange={(value) => {
                    setTransferParams((prev) => ({
                      ...prev,
                      toChain: value as ChainSlug,
                    }));
                    updateToTokens(swingSDK!, value as ChainSlug);
                  }}
                >
                  <SelectTrigger className="w-full bg-black text-white rounded-none shadow-lg border-gray-800">
                    <SelectValue placeholder="To Chain" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    {availableChains.map((chain) => (
                      <SelectItem key={chain.slug} value={chain.slug}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="to-symbol"
                  className="block text-sm font-medium text-gray-300"
                >
                  Token
                </Label>
                <Select
                  value={transferParams.toToken}
                  onValueChange={(value) =>
                    setTransferParams((prev) => ({
                      ...prev,
                      toToken: value as TokenSymbol,
                    }))
                  }
                >
                  <SelectTrigger className="w-full bg-black text-white rounded-none shadow-lg border-gray-800">
                    <SelectValue placeholder="To Token" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    {toTokens.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-2 mt-4">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-300"
              >
                Amount
              </label>
              <Input
                id="amount"
                type="number"
                className="bg-black text-white rounded-none shadow-lg border-gray-800"
                placeholder="0"
                value={transferParams.amount}
                onChange={(e) => {
                  setTransferRoute(null);
                  setTransferParams((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }));
                }}
              />
              <p className="text-xs text-gray-300">
                Balance: {balance} {transferParams.fromToken}
              </p>
            </div>

            {/* Display swap quote */}
            {transferRoute && (
              <div className="mt-4 text-sm text-gray-100">
                <p>
                  You Will Get: {transferRoute.quote.amountUSD}{" "}
                  {transferParams.toToken}
                </p>
              </div>
            )}

            {/* Swap or Connect Wallet button */}
            {isConnected ? (
              <Button
                className="w-full mt-4 py-2 bg-white text-black  hover:bg-gray-200 rounded-none"
                disabled={isLoading}
                onClick={() => (transferRoute ? startTransfer() : getQuote())}
              >
                {isLoading ? (
                  <div className="text-black">Loading...</div>
                ) : transferRoute ? (
                  "Swap"
                ) : (
                  "Get Price"
                )}
              </Button>
            ) : (
              <Button
                className="w-full mt-4 py-2 bg-white text-black hover:bg-gray-200 rounded-none"
                disabled={isLoading}
                onClick={connectWallet}
              >
                Connect Wallet
              </Button>
            )}

            <StatusSheet
              isOpen={!!status}
              logs={resultLogs}
              onCancel={async () => {
                await swingSDK?.cancelTransfer(results?.transferId!);
                setStatus(null);
              }}
            />
          </CardContent>
        </Card>
        <footer className="w-full">
          <div className="m-0 py-4">

            <div className="flex justify-center gap-20">

              <a href="https://twitter.com/0xYash_Jain" target='blank' className="text-[#718096] text-2xl">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1684 408q-67 98-162 167 1 14 1 42 0 130-38 259.5t-115.5 248.5-184.5 210.5-258 146-323 54.5q-271 0-496-145 35 4 78 4 225 0 401-138-105-2-188-64.5t-114-159.5q33 5 61 5 43 0 85-11-112-23-185.5-111.5t-73.5-205.5v-4q68 38 146 41-66-44-105-115t-39-154q0-88 44-163 121 149 294.5 238.5t371.5 99.5q-8-38-8-74 0-134 94.5-228.5t228.5-94.5q140 0 236 102 109-21 205-78-37 115-142 178 93-10 186-50z">
                  </path>
                </svg>
              </a>
              <a href="https://github.com/yashj09" target='blank' className="text-[#718096] text-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 1792 1792">
                  <path d="M896 128q209 0 385.5 103t279.5 279.5 103 385.5q0 251-146.5 451.5t-378.5 277.5q-27 5-40-7t-13-30q0-3 .5-76.5t.5-134.5q0-97-52-142 57-6 102.5-18t94-39 81-66.5 53-105 20.5-150.5q0-119-79-206 37-91-8-204-28-9-81 11t-92 44l-38 24q-93-26-192-26t-192 26q-16-11-42.5-27t-83.5-38.5-85-13.5q-45 113-8 204-79 87-79 206 0 85 20.5 150t52.5 105 80.5 67 94 39 102.5 18q-39 36-49 103-21 10-45 15t-57 5-65.5-21.5-55.5-62.5q-19-32-48.5-52t-49.5-24l-20-3q-21 0-29 4.5t-5 11.5 9 14 13 12l7 5q22 10 43.5 38t31.5 51l10 23q13 38 44 61.5t67 30 69.5 7 55.5-3.5l23-4q0 38 .5 88.5t.5 54.5q0 18-13 30t-40 7q-232-77-378.5-277.5t-146.5-451.5q0-209 103-385.5t279.5-279.5 385.5-103zm-477 1103q3-7-7-12-10-3-13 2-3 7 7 12 9 6 13-2zm31 34q7-5-2-16-10-9-16-3-7 5 2 16 10 10 16 3zm30 45q9-7 0-19-8-13-17-6-9 5 0 18t17 7zm42 42q8-8-4-19-12-12-20-3-9 8 4 19 12 12 20 3zm57 25q3-11-13-16-15-4-19 7t13 15q15 6 19-6zm63 5q0-13-17-11-16 0-16 11 0 13 17 11 16 0 16-11zm58-10q-2-11-18-9-16 3-14 15t18 8 14-14z">
                  </path>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/yash-jain-5a92861ab/" target='blank' className="text-[#718096] text-2xl">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                  <path d="M477 625v991h-330v-991h330zm21-306q1 73-50.5 122t-135.5 49h-2q-82 0-132-49t-50-122q0-74 51.5-122.5t134.5-48.5 133 48.5 51 122.5zm1166 729v568h-329v-530q0-105-40.5-164.5t-126.5-59.5q-63 0-105.5 34.5t-63.5 85.5q-11 30-11 81v553h-329q2-399 2-647t-1-296l-1-48h329v144h-2q20-32 41-56t56.5-52 87-43.5 114.5-15.5q171 0 275 113.5t104 332.5z">
                  </path>
                </svg>
              </a>
            </div>
            <div className=" text-center mt-4 text-lg">
                Made with ❤️ By Yash Jain
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Swap;
