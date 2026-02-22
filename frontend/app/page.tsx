"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Key } from "lucide-react";
import { motion } from "framer-motion";

function AgentChat() {
  const searchParams = useSearchParams();
  const tokenCategoryFromUrl = searchParams.get("tokenCategory");

  const [tokenCategory, setTokenCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: "user" | "agent", content: string, costSats?: number, claimTxid?: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    // Save token if it comes from redirect
    if (tokenCategoryFromUrl) {
      localStorage.setItem("merchant_subscription_token", tokenCategoryFromUrl);
      setTokenCategory(tokenCategoryFromUrl);

      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else {
      const stored = localStorage.getItem("merchant_subscription_token");
      if (stored) setTokenCategory(stored);
    }
  }, [tokenCategoryFromUrl]);

  const handleSend = async () => {
    if (!input.trim() || !tokenCategory) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // Call Cashflow's subscription API directly simulating merchant usage
      const res = await fetch("http://localhost:3000/api/subscription/data", {
        headers: {
          "X-Subscription-Token": tokenCategory
        }
      });

      if (!res.ok) {
        throw new Error("Payment Required or Subscription Expired");
      }

      const data = await res.json();

      let botReply = `Agent says: "I processed your request: '${userMsg}'"\nBackend msg: ${data.message}`;

      setMessages(prev => [...prev, {
        role: "agent",
        content: botReply,
        costSats: data.context.costSats,
        claimTxid: data.context.claimTxid
      }]);
      setBalance(data.context.remainingBalance);

    } catch (err: any) {
      setMessages(prev => [...prev, { role: "agent", content: `Error: ${err.message}. Your subscription might be out of funds!` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = () => {
    localStorage.removeItem("merchant_subscription_token");
    setTokenCategory(null);
    setBalance(null);
    setMessages([]);
  }

  if (!tokenCategory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-background relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-8 relative z-10"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          Merchant App v1.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-foreground sm:text-7xl relative z-10"
        >
          Subscribe to access{" "}
          <span className="relative whitespace-nowrap text-primary">
            the AI Agent
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground relative z-10"
        >
          You need an active Web3 subscription vault to use this service.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 relative z-10"
        >
          <button
            onClick={() => window.location.href = "http://localhost:3001/subscription?callbackUrl=http://localhost:3002/"}
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            Subscribe via Cashflow
          </button>
        </motion.div>

        {/* Decorative background gradients */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Merchant AI Agent</h1>
        <Button variant="outline" size="sm" onClick={handleClearSession}>Disconnect</Button>
      </div>

      <div className="flex flex-col w-full max-w-4xl border rounded-xl shadow-sm h-[80vh] bg-card overflow-hidden">
        <div className="border-b p-4 bg-muted/30 flex justify-between items-center">
          <div>
            <h2 className="font-semibold">Premium AI Agent</h2>
            <p className="text-xs text-muted-foreground font-mono" title={tokenCategory}>
              Active Token: {tokenCategory.substring(0, 16)}...
            </p>
          </div>
          {balance && (
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Vault Balance</span>
              <span className="font-mono text-sm font-semibold text-primary">{balance} sats</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground my-10 max-w-sm mx-auto p-6 border rounded-xl bg-muted/50">
              <p>Welcome! Your subscription is active.</p>
              <p className="mt-2 text-sm opacity-80">Each message you send will dynamically deduct from your Cashflow vault balance on the backend via Router402.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  {msg.costSats && (
                    <div className="text-[10px] mt-2 opacity-80 border-t pt-1 border-current/20">
                      <p>Cost: {msg.costSats} sats</p>
                      {msg.claimTxid && (
                        <p className="mt-1 text-green-600 dark:text-green-400 font-semibold">
                          🎉 JIT Claim Triggered! Tx:{" "}
                          <a
                            href={`https://chipnet.imaginary.cash/tx/${msg.claimTxid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:brightness-125"
                          >
                            {msg.claimTxid.substring(0, 10)}...
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl p-3 bg-muted flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Authenticating & generating response...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-background">
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Prompt the AI Agent and deduce your balance..."
              className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="rounded-full shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Suspense fallback={<div className="p-10 text-center flex items-center justify-center min-h-screen"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>}>
        <AgentChat />
      </Suspense>
    </div>
  );
}
