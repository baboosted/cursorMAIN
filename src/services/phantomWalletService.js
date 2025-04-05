import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { SOLANA_RPC } from "./solanaService";
import { Buffer } from "buffer";

// Polyfill Buffer for browser environment
window.Buffer = window.Buffer || Buffer;

// Add these utility functions above the phantomWalletService object

/**
 * Check if an error represents a user-initiated cancellation
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error represents a user cancellation
 */
const isUserCancellation = (error) => {
  // Check for common wallet cancellation error patterns
  return (
    error.message?.includes("User rejected") ||
    error.message?.includes("Transaction rejected") ||
    error.message?.includes("User denied") ||
    error.message?.includes("cancelled by user") ||
    error.message?.includes("canceled by user") ||
    error.name === "WalletSignTransactionError" ||
    error.code === 4001 // Standard user rejection code
  );
};

/**
 * Utility function to retry an operation with exponential backoff
 * @param {Function} operation - The async operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<any>} - Result of the operation
 */
const retryOperation = async (operation, maxRetries = 2) => {
  let lastError;

  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      if (retry > 0) {
        // Retry attempt
      }
      return await operation();
    } catch (error) {
      console.error(
        `Operation failed (attempt ${retry + 1}/${maxRetries + 1}):`,
        error
      );
      lastError = error;

      // Don't retry if this was a user-initiated cancellation
      if (isUserCancellation(error)) {
        throw error;
      }

      if (retry < maxRetries) {
        // Exponential backoff with jitter
        const delay =
          Math.min(100 * Math.pow(2, retry), 2000) + Math.random() * 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Phantom wallet service
const phantomWalletService = {
  // Service fee configuration
  feeConfig: {
    feePercentage: 2.5, // 2.5% fee
    feeCollectorAddress: "7VfiZzdzFA9E6SvXfCLbe8EMWCMW1ycmVstgo42WYo4g", // Fee collector address
    minFeeAmount: 0.001 * LAMPORTS_PER_SOL, // Minimum fee amount in lamports (0.001 SOL)
    maxFeeAmount: 0.1 * LAMPORTS_PER_SOL, // Maximum fee amount in lamports (0.1 SOL)
  },

  /**
   * Check if Phantom wallet is installed
   */
  isPhantomInstalled: () => {
    const provider = window?.solana;
    return provider?.isPhantom === true;
  },

  /**
   * Check if wallet is connected
   */
  isConnected: () => {
    try {
      const provider = window?.solana;
      return provider?.isPhantom === true && provider?.isConnected === true;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return false;
    }
  },

  /**
   * Get the Phantom wallet provider
   */
  getProvider: () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }

    window.open("https://phantom.app/", "_blank");
    throw new Error("Phantom wallet is not installed");
  },

  /**
   * Connect to Phantom wallet
   * @returns {Promise<string>} Public key as string
   */
  connect: async () => {
    try {
      // Check if Phantom is installed
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error("Phantom wallet is not installed");
      }

      // Check if already connected
      if (phantomWalletService.isConnected()) {
        return window.solana.publicKey.toString();
      }

      // If provider exists but connection is broken, try to recover
      if (
        window.solana &&
        window.solana.publicKey &&
        !window.solana.isConnected
      ) {
        // Try to disconnect first to reset connection state
        try {
          await window.solana.disconnect();
        } catch (e) {
          // Ignore errors during disconnect
        }
      }

      // Connect to wallet
      await window.solana.connect();

      if (!window.solana.publicKey) {
        throw new Error("Failed to connect to wallet");
      }

      // Return public key as string
      return window.solana.publicKey.toString();
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
      throw error;
    }
  },

  /**
   * Disconnect from Phantom wallet
   */
  disconnect: async () => {
    try {
      const provider = phantomWalletService.getProvider();
      await provider.disconnect();
      return true;
    } catch (error) {
      console.error("Error disconnecting from Phantom wallet:", error);
      throw error;
    }
  },

  /**
   * Get the connected wallet's public key
   */
  getPublicKey: () => {
    try {
      const provider = phantomWalletService.getProvider();
      if (!provider.isConnected) {
        throw new Error("Wallet not connected");
      }
      return provider.publicKey.toString();
    } catch (error) {
      console.error("Error getting public key:", error);
      throw error;
    }
  },

  /**
   * Validate if a string is a valid Solana address
   * @param {string} address - Address to validate
   * @returns {boolean} - Whether the address is valid
   */
  isValidSolanaAddress: (address) => {
    try {
      if (!address) return false;

      // Check length (base58 encoded public keys are typically 32-44 characters)
      if (address.length < 32 || address.length > 44) {
        return false;
      }

      // Try to create a PublicKey object
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Calculate transaction fee
   * @param {number} amount - Amount in SOL
   * @returns {Object} - Fee details including fee amount in SOL and lamports
   */
  calculateFee: (amount) => {
    const { feePercentage, minFeeAmount, maxFeeAmount } =
      phantomWalletService.feeConfig;

    // Calculate fee amount in lamports
    const amountInLamports = amount * LAMPORTS_PER_SOL;
    let feeInLamports = Math.floor(amountInLamports * (feePercentage / 100));

    // Apply min/max constraints
    if (feeInLamports < minFeeAmount) {
      feeInLamports = minFeeAmount;
    } else if (feeInLamports > maxFeeAmount) {
      feeInLamports = maxFeeAmount;
    }

    // Ensure we don't take more than the amount being sent
    if (feeInLamports >= amountInLamports) {
      feeInLamports = Math.floor(amountInLamports * 0.5); // Cap at 50% for very small amounts
    }

    // Calculate recipient amount in lamports
    const recipientAmountInLamports = amountInLamports - feeInLamports;

    return {
      feePercentage,
      feeInLamports,
      feeInSol: feeInLamports / LAMPORTS_PER_SOL,
      recipientAmountInLamports,
      recipientAmountInSol: recipientAmountInLamports / LAMPORTS_PER_SOL,
      totalAmountInLamports: amountInLamports,
      totalAmountInSol: amount,
    };
  },

  /**
   * Transfer SOL using Phantom wallet with fee
   * @param {string} toAddress - Recipient's public address
   * @param {number} amount - Amount of SOL to transfer
   * @param {boolean} shouldChargeFee - Whether to charge a fee (default: true)
   */
  transferSol: async (toAddress, amount, shouldChargeFee = true) => {
    return retryOperation(async () => {
      try {
        // Double check wallet connection status
        const isWalletConnected = phantomWalletService.isConnected();

        // If wallet is not connected, try to reconnect first
        if (!isWalletConnected) {
          await phantomWalletService.connect();

          // Re-check connection status after reconnection attempt
          const reconnected = phantomWalletService.isConnected();
          if (!reconnected) {
            throw new Error("Failed to reconnect wallet automatically");
          }
        }

        const provider = phantomWalletService.getProvider();

        if (!provider?.isConnected) {
          throw new Error("Wallet not connected");
        }

        // Validate recipient address
        if (!phantomWalletService.isValidSolanaAddress(toAddress)) {
          throw new Error(
            "Invalid recipient address. Please enter a valid Solana address"
          );
        }

        // Create connection
        const connection = new Connection(SOLANA_RPC, {
          commitment: "confirmed",
        });

        // Get the sender's public key
        const fromPubkey = provider.publicKey;
        const toPubkey = new PublicKey(toAddress);

        // Create a transaction
        const transaction = new Transaction();

        if (shouldChargeFee) {
          // Calculate fee
          const feeDetails = phantomWalletService.calculateFee(amount);

          // Add recipient transfer instruction
          transaction.add(
            SystemProgram.transfer({
              fromPubkey,
              toPubkey,
              lamports: feeDetails.recipientAmountInLamports,
            })
          );

          // Add fee transfer instruction (if fee is greater than dust amount)
          if (feeDetails.feeInLamports > 0) {
            transaction.add(
              SystemProgram.transfer({
                fromPubkey,
                toPubkey: new PublicKey(
                  phantomWalletService.feeConfig.feeCollectorAddress
                ),
                lamports: feeDetails.feeInLamports,
              })
            );
          }
        } else {
          // Simple transfer without fee
          transaction.add(
            SystemProgram.transfer({
              fromPubkey,
              toPubkey,
              lamports: amount * LAMPORTS_PER_SOL,
            })
          );
        }

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash("confirmed");
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        try {
          // Sign and send the transaction
          const signed = await provider.signTransaction(transaction);

          const signature = await connection.sendRawTransaction(
            signed.serialize(),
            {
              skipPreflight: false,
              preflightCommitment: "confirmed",
            }
          );

          // Confirm transaction
          const confirmation = await connection.confirmTransaction(
            {
              signature,
              blockhash,
              lastValidBlockHeight: (await connection.getBlockHeight()) + 150,
            },
            "confirmed"
          );

          // Calculate fee details for return value
          const feeDetails = shouldChargeFee
            ? phantomWalletService.calculateFee(amount)
            : { recipientAmountInSol: amount, feeInSol: 0, feePercentage: 0 };

          return {
            signature,
            confirmation,
            fee: feeDetails,
          };
        } catch (signError) {
          console.error("Error during transaction signing:", signError);

          // Check if this is a user cancellation
          if (isUserCancellation(signError)) {
            const error = new Error("Transaction cancelled by user");
            error.code = 4001;
            error.name = "UserRejectedRequestError";
            throw error;
          }

          throw signError;
        }
      } catch (error) {
        console.error("Error transferring SOL:", error);
        throw error;
      }
    });
  },

  /**
   * Get wallet balance
   * @returns {Promise<number>} Balance in SOL
   */
  getBalance: async () => {
    return retryOperation(async () => {
      try {
        // Check wallet connection
        const isConnected = phantomWalletService.isConnected();

        // If not connected, try to reconnect
        if (!isConnected) {
          await phantomWalletService.connect();

          // Verify connection was successful
          if (!phantomWalletService.isConnected()) {
            throw new Error("Wallet connection required to check balance");
          }
        }

        const provider = phantomWalletService.getProvider();

        // Verify we have a provider and public key
        if (!provider || !provider.publicKey) {
          throw new Error("Wallet not connected or public key not available");
        }

        // Create connection
        const connection = new Connection(SOLANA_RPC, {
          commitment: "confirmed",
        });

        // Get balance in lamports
        const balance = await connection.getBalance(provider.publicKey);

        // Convert from lamports to SOL
        return balance / LAMPORTS_PER_SOL;
      } catch (error) {
        console.error("Error getting wallet balance:", error);
        throw error;
      }
    });
  },
};

export default phantomWalletService;
