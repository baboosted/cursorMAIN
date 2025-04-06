import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import { BackgroundPaths } from "./ui/background-paths";
import { Text_03 } from "./ui/wave-text";
import { Globe } from "./ui/globe";
import { SplineSceneBasic } from "./ui/spline-scene-demo";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChatting = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/chat");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {isLoading && <LoadingScreen />}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-black tracking-tight text-black group-hover:text-gray-800 transition-colors">
                PATHOS
              </span>
              <span className="text-xs font-medium text-black/40 group-hover:text-black/60 transition-colors">
                MCP on Solana
              </span>
            </a>
            <div className="flex items-center space-x-6">
              <div className="contract-address-landing hidden sm:flex items-center text-sm bg-black/5 px-3 py-1.5 rounded-full">
                <span className="font-semibold text-black mr-1">CA:</span>
                <span className="text-black/70 font-mono">
                  EUNDD1qi6nRjR25yCcXAYKsBDbVPtUrjFhtUmqsWpump
                </span>
              </div>
              <button
                onClick={handleStartChatting}
                className="px-5 py-1.5 bg-gradient-to-r from-black to-gray-800 text-white text-sm font-medium rounded-full hover:from-gray-800 hover:to-black transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Chatting
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[60vh] bg-white">
        <div className="absolute inset-0 z-0">
          <BackgroundPaths title="" hideContent={true} className="h-full" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block w-full backdrop-blur-sm p-6 rounded-2xl bg-white/30">
              <Text_03
                text="MCP-Enabled Autonomous Agent"
                className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-8 text-black leading-normal"
              />

              <p className="text-xl sm:text-2xl text-black/80 max-w-3xl mx-auto leading-relaxed animate-fadeIn mt-12 font-medium">
                The first operational implementation of the Model Context
                Protocol (MCP) on Solana, enabling real-time communication
                between large language models (LLMs) and on-chain programs. A
                foundational bridge between autonomous AI agents and
                decentralized infrastructure.
              </p>
              <p className="mt-6 text-base sm:text-lg text-black/70 max-w-2xl mx-auto">
                Unlock the full potential of autonomous AI agents with a
                standardized protocol layer for blockchain interaction, context
                retrieval, and transaction execution.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-black/5 to-black/10 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4">
                Natural Language
              </h2>
              <p className="text-black/60 leading-relaxed">
                Use natural language to interface with smart contracts and
                wallets. No code or CLI needed — ask questions, retrieve
                on-chain data, or initiate actions through plain, conversational
                prompts.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-black/5 to-black/10 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4">
                Secure Protocol
              </h2>
              <p className="text-black/60 leading-relaxed">
                MCP provides a cryptographically secure, deterministic layer for
                message passing between AI agents and blockchain programs —
                ensuring verifiability, consistency, and trust.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-black/5 to-black/10 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black mb-4">
                Real-time Data
              </h2>
              <p className="text-black/60 leading-relaxed">
                Stream live blockchain data into AI agents via natural language
                queries. Get real-time wallet states, token activity, and
                contract interactions — all in milliseconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2
                className="text-4xl md:text-5xl font-black tracking-tight mb-8 from-white to-gray-400 pb-2"
                style={{
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundImage: "linear-gradient(to right, white, #a3a3a3)",
                  lineHeight: 1.2,
                  paddingBottom: "0.5rem",
                  display: "inline-block",
                }}
              >
                MCP Integration
              </h2>
              <p className="text-xl text-white/60 mb-8 leading-relaxed">
                Experience the power of the Model Context Protocol (MCP) on
                Solana — a standardized interface that enables large language
                models to securely read from and write to blockchain
                environments. Our implementation bridges decentralized compute
                with real-time on-chain data, unlocking intelligent automation
                across Solana's ecosystem.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-white transition-colors">
                      AI–Blockchain Bridge
                    </h3>
                    <p className="text-white/60 group-hover:text-white/80 transition-colors">
                      Connects Claude 3.7 Sonnet directly to Solana's on-chain
                      programs via MCP, enabling real-time state awareness and
                      actionability.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-white transition-colors">
                      Comprehensive RPC Methods
                    </h3>
                    <p className="text-white/60 group-hover:text-white/80 transition-colors">
                      Leverage the full RPC suite of Solana through standardized
                      MCP calls — from balance queries to contract invocations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 group">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-300">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-white transition-colors">
                      Automated Transactions
                    </h3>
                    <p className="text-white/60 group-hover:text-white/80 transition-colors">
                      Trigger on-chain transactions and smart contract calls via
                      natural language prompts, mapped to verified intent
                      through MCP.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <SplineSceneBasic />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section - NEW SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-black mb-6">
              Powerful Use Cases
            </h2>
            <p className="text-xl text-black/60 max-w-3xl mx-auto">
              Unleash the potential of AI-powered blockchain interactions with
              our MCP implementation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black">
                  AI-Powered Trading
                </h3>
              </div>
              <p className="text-black/60 leading-relaxed">
                Autonomous agents analyze live market data, identify trading
                opportunities, and execute on-chain trades directly via MCP —
                delivering low-latency execution across Solana's DeFi ecosystem.
              </p>
            </div>

            <div className="p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black">
                  Smart Contract Automation
                </h3>
              </div>
              <p className="text-black/60 leading-relaxed">
                Automate smart contract execution and dApp interactions using
                natural language prompts mapped to intent via MCP — eliminating
                the need for manual scripting or complex UIs.
              </p>
            </div>

            <div className="p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black">
                  Real-time Analytics
                </h3>
              </div>
              <p className="text-black/60 leading-relaxed">
                Stream blockchain events into Claude 3.7 Sonnet and other LLMs
                via MCP, enabling real-time analysis, anomaly detection, and
                insight generation in natural language.
              </p>
            </div>

            <div className="p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-black/5 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black">
                  Multi-Agent Coordination
                </h3>
              </div>
              <p className="text-black/60 leading-relaxed">
                Orchestrate decentralized AI agents that communicate and
                coordinate across Solana protocols via MCP — supporting complex
                workflows, DAO tooling, and automated governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Redesigned */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-black to-gray-900">
        {/* Glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-blue-900/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl"></div>
        </div>

        {/* Content container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-left lg:text-left">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-8 leading-tight">
                Ready to Experience{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
                  MCP?
                </span>
              </h2>

              <div className="space-y-6 mb-10">
                <p className="text-xl text-white/70">
                  Join the future of blockchain interaction with our AI-powered
                  protocol
                </p>
                <p className="text-lg text-white/50">
                  Built with comprehensive RPC methods for seamless blockchain
                  operations
                </p>
              </div>

              <button
                onClick={handleStartChatting}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
              >
                Start Chatting Now
              </button>
            </div>

            {/* Right content - Globe */}
            <div className="relative h-[500px] w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="globe-container bg-gradient-to-b from-white/5 to-transparent p-1 rounded-full border border-white/10 w-[350px] h-[350px] flex items-center justify-center shadow-2xl backdrop-blur-sm">
                  <div className="absolute inset-2 rounded-full glow-effect bg-blue-500/5"></div>
                  <Globe className="scale-150 opacity-90" />
                </div>
              </div>

              {/* Animated markers */}
              <div className="absolute inset-0">
                <div
                  className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500 rounded-full opacity-80 animate-ping"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div
                  className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-500 rounded-full opacity-70 animate-ping"
                  style={{ animationDuration: "2.5s" }}
                ></div>
                <div
                  className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-indigo-500 rounded-full opacity-80 animate-ping"
                  style={{ animationDuration: "4s" }}
                ></div>
                <div
                  className="absolute top-1/2 right-1/5 w-1 h-1 bg-teal-500 rounded-full opacity-90 animate-ping"
                  style={{ animationDuration: "3.5s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom brand bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-black text-white tracking-tight">
                    PATHOS
                  </span>
                  <span className="text-sm text-white/40 hidden sm:inline">
                    MCP on Solana
                  </span>
                </div>
                <div className="contract-address-landing-footer flex items-center text-sm bg-white/10 px-3 py-1.5 rounded-full ml-4">
                  <span className="font-semibold text-white mr-1">CA:</span>
                  <span className="text-white/70 font-mono">
                    EUNDD1qi6nRjR25yCcXAYKsBDbVPtUrjFhtUmqsWpump
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-white/50">Network Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-2xl font-black tracking-tight text-black hover:text-gray-800 transition-colors"
              >
                PATHOS
              </a>
              <span className="text-black/40">MCP on Solana</span>
            </div>
            <div className="contract-address-landing flex items-center text-sm bg-black/5 px-3 py-1.5 rounded-full mt-4 md:mt-0">
              <span className="font-semibold text-black mr-1">CA:</span>
              <span className="text-black/70 font-mono">
                EUNDD1qi6nRjR25yCcXAYKsBDbVPtUrjFhtUmqsWpump
              </span>
            </div>
          </div>
          <div className="mt-8 text-center text-black/40 text-sm">
            © {new Date().getFullYear()} PATHOS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
