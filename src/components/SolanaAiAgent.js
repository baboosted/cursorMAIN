import React, { useState, useEffect, useRef, useCallback } from "react";
import { getCurrentSlot, getAccountBalance } from "../services/solanaService";
import phantomWalletService from "../services/phantomWalletService";
import { Link } from "react-router-dom";
import "./SolanaAiAgent.css";

const SolanaAiAgent = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm Pathos, your Solana AI assistant. I can help with Solana blockchain operations like checking balances and making transfers. To get started, please connect your Phantom wallet by clicking the 'Connect Wallet' button above, or simply ask me to connect your wallet in chat. What would you like to do today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [walletBalance, setWalletBalance] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [currentSlot, setCurrentSlot] = useState(null);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCurrentSlot = async () => {
    try {
      setConnectionStatus("checking");
      const slot = await getCurrentSlot();
      setCurrentSlot(slot);
      setConnectionStatus("connected");
    } catch (err) {
      console.error("Error getting current slot:", err);
      setConnectionStatus("error");
    }
  };

  const fetchWalletBalance = useCallback(async () => {
    try {
      const balance = await phantomWalletService.getBalance();
      setWalletBalance(balance);
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  }, []);

  const addAssistantMessage = useCallback((content) => {
    // Set typing indicator immediately
    setTypingIndicator(true);

    // Process content to enhance formatting
    const processedContent = content.replace(
      /Signature: ([a-zA-Z0-9]{20,})/g,
      'Signature: <span class="transaction-signature">$1</span>'
    );

    // Calculate a natural typing delay based on message length
    const messageLength = content.length;
    const baseDelay = 200; // Base delay of 200ms
    const typingDelay = Math.min(baseDelay + (messageLength / 6.7) * 100, 800); // Cap at 800ms

    // Force a re-render to ensure typing indicator is visible
    setTimeout(() => {
      // Simulate natural typing delay
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: processedContent, isHTML: true },
        ]);
        setTypingIndicator(false);
      }, typingDelay);
    }, 0);
  }, []);

  const formatAddress = useCallback((address) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, []);

  const handleWalletConnection = useCallback(async () => {
    try {
      setLoading(true);

      // Check if already connected to avoid duplicate connection
      if (phantomWalletService.isConnected() && walletConnected) {
        // Just fetch the balance and return
        await fetchWalletBalance();
        return;
      }

      // Attempt to connect wallet
      const pubKey = await phantomWalletService.connect();

      setPublicKey(pubKey);
      setWalletConnected(true);

      // Get wallet balance
      try {
        await fetchWalletBalance();
      } catch (balanceError) {
        console.error("Error fetching balance after connection:", balanceError);
        // Don't throw here, we'll still consider the connection successful
      }

      // Add a message to the chat
      addAssistantMessage(
        `Wallet connected successfully! Your address: ${formatAddress(pubKey)}`
      );
    } catch (err) {
      console.error("Error connecting wallet:", err);
      // Check if Phantom is installed
      if (!phantomWalletService.isPhantomInstalled()) {
        addAssistantMessage(
          "It seems Phantom wallet is not installed. Please install the Phantom browser extension first."
        );
      } else {
        addAssistantMessage(
          `Failed to connect wallet: ${err.message}. Please try again.`
        );
      }

      // Reset connection state on error
      setWalletConnected(false);
      setPublicKey("");
    } finally {
      setLoading(false);
    }
  }, [
    walletConnected,
    publicKey,
    fetchWalletBalance,
    addAssistantMessage,
    formatAddress,
  ]);

  // Check if Phantom is installed and connected on component mount
  useEffect(() => {
    const isInstalled = phantomWalletService.isPhantomInstalled();

    // Handle Phantom availability
    if (isInstalled) {
      // For Phantom wallet, we need to use their events whenever possible
      // as their isConnected property is unreliable on first load

      // Check if publicKey exists instead of relying on isConnected
      if (window?.solana?.publicKey) {
        const publicKey = window.solana.publicKey.toString();
        setPublicKey(publicKey);
        setWalletConnected(true);

        // Fetch balance separately
        fetchWalletBalance().catch((err) => {
          console.error("Error fetching initial balance:", err);
        });
      }

      fetchCurrentSlot();
    } else {
      addAssistantMessage(
        "I notice you don't have Phantom wallet installed. You'll need it to perform Solana transfers. Would you like to know how to install it?"
      );
    }

    // Update blockchain slot every 30 seconds
    const interval = setInterval(fetchCurrentSlot, 30000);

    // Cleanup function
    return () => {
      clearInterval(interval);
      // NOTE: We don't automatically disconnect on unmount anymore
      // as that can lead to confusing behavior for users
    };
  }, [fetchWalletBalance, addAssistantMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update wallet balance when connected
  useEffect(() => {
    if (walletConnected) {
      fetchWalletBalance();
    }
  }, [walletConnected, fetchWalletBalance]);

  // Setup Phantom wallet event listeners
  useEffect(() => {
    const setupWalletEventListeners = () => {
      if (!window?.solana) {
        return;
      }

      // Listen for connect events
      window.solana.on("connect", () => {
        const publicKey = window.solana.publicKey.toString();
        setPublicKey(publicKey);
        setWalletConnected(true);

        // Fetch balance after connection
        fetchWalletBalance().catch((err) => {
          console.error("Error fetching balance after connection event:", err);
        });
      });

      // Listen for disconnect events
      window.solana.on("disconnect", () => {
        setWalletConnected(false);
        setPublicKey("");
        setWalletBalance(null);

        // Notify user
        addAssistantMessage(
          "Your wallet was disconnected by Phantom. To continue using Solana features, please reconnect your wallet."
        );
      });

      // Listen for account change events
      window.solana.on("accountChanged", (newPublicKey) => {
        if (newPublicKey) {
          setPublicKey(newPublicKey.toString());

          // Refresh balance when account changes
          fetchWalletBalance().catch((err) => {
            console.error("Error fetching balance after account change:", err);
          });
        } else {
          setWalletConnected(false);
          setPublicKey("");
          setWalletBalance(null);
        }
      });
    };

    // Setup event listeners
    setupWalletEventListeners();

    // Cleanup function to remove event listeners
    return () => {
      if (window?.solana) {
        window.solana.removeAllListeners("connect");
        window.solana.removeAllListeners("disconnect");
        window.solana.removeAllListeners("accountChanged");
      }
    };
  }, [fetchWalletBalance, addAssistantMessage]);

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await phantomWalletService.disconnect();
      setPublicKey("");
      setWalletConnected(false);
      setWalletBalance(null);
      addAssistantMessage("Wallet disconnected successfully.");
    } catch (err) {
      console.error("Disconnect error:", err);
      addAssistantMessage(`Failed to disconnect: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceCheck = async (address = null) => {
    try {
      setLoading(true);
      if (address) {
        // Check balance of provided address
        if (!phantomWalletService.isValidSolanaAddress(address)) {
          addAssistantMessage(
            "That doesn't appear to be a valid Solana address. Please check and try again."
          );
          return;
        }

        const balance = await getAccountBalance(address);
        addAssistantMessage(
          `The address ${formatAddress(
            address
          )} has a balance of ${balance.toFixed(6)} SOL.`
        );
      } else if (walletConnected) {
        // Check connected wallet balance
        await fetchWalletBalance();
        addAssistantMessage(
          `Your wallet balance is ${walletBalance.toFixed(6)} SOL.`
        );
      } else {
        addAssistantMessage(
          "You need to connect your wallet first to check its balance."
        );
      }
    } catch (err) {
      console.error("Balance check error:", err);
      addAssistantMessage(`Error checking balance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (recipientAddress, amount) => {
    // Double-check wallet connection status
    const isActuallyConnected = phantomWalletService.isConnected();

    // Handle wallet connection mismatch - try to reconnect before failing
    if (!isActuallyConnected && walletConnected) {
      // Show message to user
      addAssistantMessage(
        "Your wallet appears to be disconnected. Attempting to reconnect automatically..."
      );

      try {
        // Try to reconnect
        setLoading(true);
        const pubKey = await phantomWalletService.connect();
        setPublicKey(pubKey);

        // Refresh balance
        await fetchWalletBalance();

        // Now we can proceed with the transfer
      } catch (reconnectError) {
        console.error("Failed to reconnect wallet:", reconnectError);
        addAssistantMessage(
          "I couldn't reconnect to your wallet automatically. Please click the Connect Wallet button and try your transfer again."
        );

        // Reset connection state
        setWalletConnected(false);
        setPublicKey("");
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    } else if (!walletConnected) {
      addAssistantMessage(
        "You need to connect your wallet first to make transfers. Please click the Connect Wallet button."
      );
      return;
    }

    // Re-check connection after potential reconnection attempt
    if (!phantomWalletService.isConnected()) {
      addAssistantMessage(
        "There seems to be an issue with your wallet connection. Please try refreshing the page and connecting your wallet again."
      );

      // Reset connection state
      setWalletConnected(false);
      setPublicKey("");
      return;
    }

    if (!recipientAddress || !amount) {
      addAssistantMessage(
        "I need both a recipient address and an amount to make a transfer."
      );
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      addAssistantMessage("The amount must be a positive number.");
      return;
    }

    // Validate address format
    if (!phantomWalletService.isValidSolanaAddress(recipientAddress)) {
      addAssistantMessage(
        "That doesn't appear to be a valid Solana address. Please check and try again."
      );
      return;
    }

    // Verify the user has enough balance
    if (walletBalance !== null && parseFloat(amount) > walletBalance) {
      addAssistantMessage(
        `Insufficient balance. You're trying to send ${parseFloat(
          amount
        ).toFixed(6)} SOL but your wallet only has ${walletBalance.toFixed(
          6
        )} SOL.`
      );
      return;
    }

    try {
      setLoading(true);
      addAssistantMessage(
        `Preparing to send ${amount} SOL to ${formatAddress(
          recipientAddress
        )}...`
      );

      // Transfer SOL
      const result = await phantomWalletService.transferSol(
        recipientAddress,
        parseFloat(amount),
        true // Charge fee
      );

      addAssistantMessage(
        `Transaction successful! ✅\nSignature: \n${
          result.signature
        }\n\nRecipient received: ${result.fee.recipientAmountInSol.toFixed(
          6
        )} SOL`
      );

      // Refresh balance
      await fetchWalletBalance();
    } catch (err) {
      console.error("Transfer error:", err);

      // Handle different error types
      if (err.message?.includes("Wallet not connected")) {
        // The wallet connection was lost
        setWalletConnected(false);
        setPublicKey("");
        addAssistantMessage(
          "The wallet connection was lost. Please reconnect your wallet and try again."
        );
      } else if (
        err.message?.includes("User rejected") ||
        err.message?.includes("User denied") ||
        err.message?.includes("Transaction rejected") ||
        err.message?.includes("cancelled by user") ||
        err.message?.includes("canceled by user") ||
        err.name === "WalletSignTransactionError" ||
        err.code === 4001
      ) {
        // User cancelled the transaction
        addAssistantMessage(
          "You cancelled the transaction. No SOL was transferred."
        );
      } else {
        addAssistantMessage(`Transaction failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSlotCheck = async () => {
    try {
      setLoading(true);
      await fetchCurrentSlot();
      addAssistantMessage(`The current Solana slot is ${currentSlot}.`);
    } catch (err) {
      console.error("Slot check error:", err);
      addAssistantMessage(`Error checking current slot: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addUserMessage = (content) => {
    setMessages((prevMessages) => [...prevMessages, { role: "user", content }]);
  };

  // Call Claude API to process user input
  const callClaudeApi = async (messageHistory, userMessage) => {
    try {
      // Prepare system prompt with context
      const systemPrompt = `You are an AI assistant specializing in Solana blockchain operations.

Current Solana context:
- Wallet connected: ${walletConnected ? "Yes" : "No"}
${walletConnected ? `- Wallet address: ${publicKey}` : ""}
${
  walletBalance !== null
    ? `- Wallet balance: ${walletBalance.toFixed(6)} SOL`
    : ""
}
- Blockchain connection: ${connectionStatus}
${currentSlot ? `- Current slot: ${currentSlot}` : ""}

You can help users with the following Solana operations:
1. Connect to Phantom wallet
2. Disconnect from Phantom wallet
3. Check wallet balance
4. Check balance of any Solana address
5. Transfer SOL to another address
6. Check current Solana blockchain slot

IMPORTANT INSTRUCTIONS:
- When a user wants to perform an action, identify the intent and include <action> tags in your response.
- Valid actions are: <connect_wallet>, <disconnect_wallet>, <check_balance:address?>, <transfer_sol:recipientAddress,amount>, <check_slot>
- For balance checks, include the address parameter if a specific address was provided, otherwise leave it empty.
- For transfers, always include both recipient address and amount.
- Only include ONE action tag per response.
- Example: "I'll check your balance. <check_balance:>"
- Example: "I'll send 1 SOL to that address. <transfer_sol:8xrt45...zQ9,1.0>"
- If the user wants to check a specific address balance: "I'll check that address. <check_balance:8xrt45...zQ9>"
- DO NOT include action tags if the user is just asking general questions.
- IMPORTANT: If your response already contains the information (such as current slot number or balance), DO NOT include an action tag. This avoids redundant actions and duplicate messages.
- Respond conversationally and briefly. Don't overexplain basic concepts unless asked.`;

      // Prepare message history for Claude
      const claudeMessages = messageHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add new user message
      claudeMessages.push({
        role: "user",
        content: userMessage,
      });

      // Determine API URL based on environment
      let apiUrl;
      if (process.env.NODE_ENV === "production") {
        // In production, use the environment variable or default to /api
        apiUrl = process.env.REACT_APP_API_URL || "/api";
      } else {
        // In development, try to use the environment variable or default to localhost
        apiUrl = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
      }

      // Prepare request data
      const requestData = {
        messages: claudeMessages,
        system: systemPrompt,
      };

      // Call our backend proxy
      const response = await fetch(`${apiUrl}/claude`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Handle 405 Method Not Allowed error specifically
      if (response.status === 405) {
        console.error("405 Method Not Allowed error. This typically means:");
        console.error("1. The API endpoint doesn't support POST method");
        console.error(
          "2. There might be a routing issue in your backend server"
        );
        console.error(
          "3. A CORS or proxy configuration might be blocking the request"
        );

        // Try to get more detailed error information
        const errorText = await response.text();

        // Log detailed request info for debugging
        console.error("Request details:", {
          url: `${apiUrl}/claude`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        throw new Error(
          `API Method Not Allowed (405): The API endpoint doesn't support the POST method. Detail: ${errorText}`
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorJson;

        // Try to parse as JSON if possible
        try {
          errorJson = JSON.parse(errorText);
          console.error("API error response:", errorJson);
        } catch (e) {
          console.error("API error (not JSON):", response.status, errorText);
        }

        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.content || !data.content[0] || !data.content[0].text) {
        console.error("Unexpected API response format:", data);
        throw new Error("Unexpected API response format");
      }

      return data.content[0].text;
    } catch (error) {
      console.error("Error calling Claude API:", error);
      throw error;
    }
  };

  // Extract action from Claude's response
  const extractAction = (response) => {
    // Match action tags with optional parameters
    const connectWalletMatch = response.match(/<connect_wallet>/);
    const disconnectWalletMatch = response.match(/<disconnect_wallet>/);
    const checkBalanceMatch = response.match(/<check_balance:([^>]*)>/);
    const transferSolMatch = response.match(/<transfer_sol:([^,]*),([^>]*)>/);
    const checkSlotMatch = response.match(/<check_slot>/);

    // Clean the response by removing the action tags
    const cleanedResponse = response
      .replace(/<connect_wallet>/g, "")
      .replace(/<disconnect_wallet>/g, "")
      .replace(/<check_balance:[^>]*>/g, "")
      .replace(/<transfer_sol:[^>]*>/g, "")
      .replace(/<check_slot>/g, "")
      .trim();

    // Determine the action
    if (connectWalletMatch) {
      return { response: cleanedResponse, action: { type: "connect_wallet" } };
    } else if (disconnectWalletMatch) {
      return {
        response: cleanedResponse,
        action: { type: "disconnect_wallet" },
      };
    } else if (checkBalanceMatch) {
      const address = checkBalanceMatch[1].trim();
      return {
        response: cleanedResponse,
        action: { type: "check_balance", address: address || null },
      };
    } else if (transferSolMatch) {
      const recipientAddress = transferSolMatch[1].trim();
      const amount = transferSolMatch[2].trim();
      return {
        response: cleanedResponse,
        action: {
          type: "transfer_sol",
          recipientAddress,
          amount: parseFloat(amount),
        },
      };
    } else if (checkSlotMatch) {
      return { response: cleanedResponse, action: { type: "check_slot" } };
    }

    // No action found
    return { response: response, action: null };
  };

  // Process user input with Claude
  const processInput = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput("");
    addUserMessage(userInput);
    setLoading(true);

    try {
      // Call Claude API
      const claudeResponse = await callClaudeApi(messages, userInput);

      // Extract action and clean response
      const { response, action } = extractAction(claudeResponse);

      // Check if action is redundant based on response content
      const shouldExecuteAction = isActionNecessary(response, action);

      // Display the cleaned response
      addAssistantMessage(response);

      // Execute action if present and not redundant
      if (action && shouldExecuteAction) {
        await executeAction(action);
      }
    } catch (error) {
      console.error("Error processing input:", error);

      // Provide more descriptive error messages based on error type
      let errorMessage =
        "I'm sorry, I encountered an error processing your request. Please try again.";

      if (error.message.includes("API error: 405")) {
        errorMessage =
          "I'm having trouble communicating with my API. There seems to be a configuration issue with the server. The team has been notified.";
      } else if (error.message.includes("API error:")) {
        errorMessage =
          "I'm having trouble accessing my AI capabilities right now. This could be due to network issues or server load. Please try again in a moment.";
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        errorMessage =
          "I'm having trouble connecting to my servers. Please check your internet connection and try again.";
      } else if (
        error.message.includes("timeout") ||
        error.message.includes("Timed out")
      ) {
        errorMessage =
          "The request took too long to process. This might be due to high server load. Please try again in a moment.";
      }

      addAssistantMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if an action is necessary or if the response already contains the information
  const isActionNecessary = (response, action) => {
    if (!action) return false;

    // Skip slot checking action if response already contains slot information
    if (
      action.type === "check_slot" &&
      (response.includes("slot") || response.includes("block"))
    ) {
      return false;
    }

    // Skip balance checking action if response already contains balance information
    if (
      action.type === "check_balance" &&
      !action.address &&
      (response.includes("balance") || response.includes("SOL"))
    ) {
      return false;
    }

    // Skip wallet connection action if response indicates connection status
    if (
      action.type === "connect_wallet" &&
      response.includes("connected") &&
      response.includes("wallet")
    ) {
      return false;
    }

    // Skip wallet disconnection action if response indicates disconnection
    if (
      action.type === "disconnect_wallet" &&
      response.includes("disconnect") &&
      response.includes("wallet")
    ) {
      return false;
    }

    return true;
  };

  // Execute action extracted from Claude's response
  const executeAction = async (action) => {
    switch (action.type) {
      case "connect_wallet":
        await handleWalletConnection();
        break;
      case "disconnect_wallet":
        await handleDisconnect();
        break;
      case "check_balance":
        await handleBalanceCheck(action.address);
        break;
      case "transfer_sol":
        await handleTransfer(action.recipientAddress, action.amount);
        break;
      case "check_slot":
        await handleSlotCheck();
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleConnect = async () => {
    if (walletConnected) {
      await handleDisconnect();
    } else {
      await handleWalletConnection();
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      processInput();
    }
  };

  // Function to maintain wallet connection state in sync with provider
  const checkWalletConnectionStatus = useCallback(() => {
    if (walletConnected) {
      const isStillConnected = phantomWalletService.isConnected();

      // Check for state mismatch
      if (!isStillConnected && walletConnected) {
        setWalletConnected(false);
        setPublicKey("");
        // Notify user
        addAssistantMessage(
          "Your wallet was disconnected. Please reconnect to continue using Solana features."
        );
      }
    }
  }, [walletConnected, addAssistantMessage]);

  // Add this useEffect with the connection checking interval
  useEffect(() => {
    // Check wallet connection status every 15 seconds
    const connectionCheckInterval = setInterval(
      checkWalletConnectionStatus,
      15000
    );

    // Clean up interval on unmount
    return () => {
      clearInterval(connectionCheckInterval);
    };
  }, [checkWalletConnectionStatus]);

  return (
    <div className="solana-ai-agent">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Pathos Agent</h1>
          <div className="chat-header-right">
            {walletConnected && walletBalance !== null && (
              <div className="wallet-info">
                <div className="wallet-address">{formatAddress(publicKey)}</div>
                <div className="wallet-balance">
                  {walletBalance.toFixed(4)} SOL
                </div>
              </div>
            )}
            <div className="contract-address">
              <span className="ca-label">CA:</span>
              <span className="ca-value">
                EUNDD1qi6nRjR25yCcXAYKsBDbVPtUrjFhtUmqsWpump
              </span>
            </div>
            <button
              onClick={
                walletConnected ? handleDisconnect : handleWalletConnection
              }
              className={walletConnected ? "wallet-connected" : ""}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 7H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 11H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {walletConnected ? "Disconnect" : "Connect Wallet"}
            </button>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.role === "user" ? "user-message" : "ai-message"
              }`}
            >
              <div className="message-content">
                {message.isHTML ? (
                  <div dangerouslySetInnerHTML={{ __html: message.content }} />
                ) : (
                  message.content
                )}
              </div>
              <div className="message-timestamp">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          ))}
          {typingIndicator && (
            <div className="loading">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
              placeholder="Type your message..."
              disabled={loading}
              ref={inputRef}
            />
            <button onClick={handleSubmit} disabled={loading || !input.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
      <div className="app-footer">
        <div className="contract-address-footer">
          <span className="ca-label">CA:</span>
          <span className="ca-value">
            EUNDD1qi6nRjR25yCcXAYKsBDbVPtUrjFhtUmqsWpump
          </span>
        </div>
        <Link to="/" className="home-button">
          Exit Pathos
        </Link>
      </div>
    </div>
  );
};

export default SolanaAiAgent;
