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

    // Calculate a natural typing delay based on message length
    // Average typing speed is about 80 words per minute, or ~400 characters per minute
    // This means ~6.7 characters per second
    const messageLength = content.length;
    const baseDelay = 200; // Base delay of 200ms
    const typingDelay = Math.min(baseDelay + (messageLength / 6.7) * 100, 800); // Cap at 800ms

    // Force a re-render to ensure typing indicator is visible
    setTimeout(() => {
      // Simulate natural typing delay
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content },
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

      const pubKey = await phantomWalletService.connect();
      setPublicKey(pubKey);
      setWalletConnected(true);

      // Get wallet balance
      await fetchWalletBalance();

      // Add a message to the chat
      addAssistantMessage(
        `Wallet connected successfully! Your address: ${formatAddress(pubKey)}`
      );
    } catch (err) {
      console.error("Error connecting wallet:", err);
      addAssistantMessage(
        `Failed to connect wallet: ${err.message}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  }, [walletConnected, fetchWalletBalance, addAssistantMessage, formatAddress]);

  // Check if Phantom is installed and connected on component mount
  useEffect(() => {
    const isInstalled = phantomWalletService.isPhantomInstalled();

    if (isInstalled) {
      if (phantomWalletService.isConnected()) {
        handleWalletConnection();
      }
      fetchCurrentSlot();
    } else {
      addAssistantMessage(
        "I notice you don't have Phantom wallet installed. You'll need it to perform Solana transfers. Would you like to know how to install it?"
      );
    }

    // Update blockchain slot every 30 seconds
    const interval = setInterval(fetchCurrentSlot, 30000);

    // Cleanup function to disconnect wallet when component unmounts
    return () => {
      clearInterval(interval);
      // Disconnect wallet if connected
      if (phantomWalletService.isConnected()) {
        phantomWalletService.disconnect().catch((err) => {
          console.error("Error disconnecting wallet during cleanup:", err);
        });
      }
    };
  }, [handleWalletConnection, addAssistantMessage]);

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
    if (!walletConnected) {
      addAssistantMessage(
        "You need to connect your wallet first to make transfers."
      );
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
        `Transaction successful! ✅\nSignature: ${
          result.signature
        }\n\nRecipient received: ${result.fee.recipientAmountInSol.toFixed(
          6
        )} SOL\nService fee: ${result.fee.feeInSol.toFixed(6)} SOL (${
          result.fee.feePercentage
        }%)`
      );

      // Refresh balance
      await fetchWalletBalance();
    } catch (err) {
      console.error("Transfer error:", err);
      addAssistantMessage(`Transaction failed: ${err.message}`);
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
- Do NOT include action tags if the user is just asking general questions.
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

      console.log("Using API URL:", apiUrl);

      // Call our backend proxy
      const response = await fetch(`${apiUrl}/claude`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: claudeMessages,
          system: systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", response.status, errorText);
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

      // Display the cleaned response
      addAssistantMessage(response);

      // Execute action if present
      if (action) {
        await executeAction(action);
      }
    } catch (error) {
      console.error("Error processing input:", error);
      addAssistantMessage(
        "I'm sorry, I encountered an error processing your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
              <div className="message-content">{message.content}</div>
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
      <Link to="/" className="home-button">
        Exit Pathos
      </Link>
    </div>
  );
};

export default SolanaAiAgent;
