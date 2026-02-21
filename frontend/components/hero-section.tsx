import { useState } from "react";
import { Copy, Plus, Key, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText("npx create-cashflow-app@latest");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          Merchant App v1.0 is now live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-foreground sm:text-7xl"
        >
          Monetize your AI Agents with{" "}
          <span className="relative whitespace-nowrap text-primary">
            Cashflow
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Create pay-per-prompt AI agents or full Web3 subscription models using Cashflow's powerful 402 architecture. Seamless integration in minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => window.location.href = "http://localhost:3001/subscription?callbackUrl=http://localhost:3002/agent"}
            className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            Try the Agent Demo
          </button>

          <button
            onClick={copyCode}
            className="rounded-full bg-secondary px-6 py-3.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 flex items-center gap-2 border"
          >
            <TerminalSquare className="w-4 h-4 text-muted-foreground" />
            <code className="text-secondary-foreground">npx create-cashflow-app</code>
            {copied ? (
              <span className="text-primary ml-2 text-xs">Copied!</span>
            ) : (
              <Copy className="w-4 h-4 ml-2 text-muted-foreground hover:text-foreground transition-colors" />
            )}
          </button>
        </motion.div>
      </div>

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
    </section>
  );
}
