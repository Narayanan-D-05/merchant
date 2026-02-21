"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

function AgentChat() {
  const searchParams = useSearchParams();
  const tokenCategoryFromUrl = searchParams.get("tokenCategory");
  
  const [tokenCategory, setTokenCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: "user" | "agent", content: string, costSats?: number, txId?: string}[]>([]);
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
      
      setMessages(prev => [...prev, { 
        role: "agent", 
        content: `Agent says: "I processed your request: '${userMsg}'" (Mock response)\nBackend msg: ${data.message}`,
        costSats: data.context.costSats
      }]);
      setBalance(data.context.remainingBalance);
      
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "agent", content: `Error: ${err.message}. Your subscription might be out of funds!` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenCategory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-4">You need an active subscription!</h2>
        <p className="text-muted-foreground mb-6">Please subscribe to access the AI Agent.</p>
        <Button onClick={() => window.location.href = "/"}>Go back to Subscribe</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto border rounded-xl shadow-sm h-[80vh] mt-10 bg-card overflow-hidden">
      <div className="border-b p-4 bg-muted/30 flex justify-between items-center">
        <div>
          <h2 className="font-semibold">Premium AI Agent</h2>
          <p className="text-xs text-muted-foreground font-mono truncate max-w-xs" title={tokenCategory}>
            Token: {tokenCategory.substring(0, 10)}...
          </p>
        </div>
        {balance && (
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Remaining Balance</span>
            <span className="font-mono text-sm font-semibold">{balance} sats</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground my-10">
            Ask me anything! Each message deducts from your Cashflow subscription balance.
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                {msg.costSats && (
                  <p className="text-[10px] mt-2 opacity-70 border-t pt-1 border-current/20">
                    Cost: {msg.costSats} sats
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl p-3 bg-muted flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Thinking (and paying)...</span>
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
            placeholder="Type your message..."
            className="flex-1 rounded-full border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="rounded-full shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AgentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
        <AgentChat />
      </Suspense>
    </div>
  );
}
