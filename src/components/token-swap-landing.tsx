"use client";

import { Button } from "@/ui/Button";
import {
  ArrowRight,
  Repeat,
  Wallet,
  Zap,
  BarChart,
  Shield,
} from "lucide-react";

export default function TokenSwapLanding() {
  let c: string = "yash";
  let a: number = 565;
  let bool: boolean = true;
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold">TokenSwap</div>
        <Button
          variant="outline"
          className="text-white border-white hover:bg-white hover:text-black"
        >
          Launch App
        </Button>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6">
            Cross-Chain Token Swaps Made Easy
          </h1>
          <p className="text-xl mb-8 text-gray-400 max-w-2xl mx-auto">
            Perform decentralized, non-custodial token swaps across multiple
            chains with low fees and high liquidity.
          </p>
          <Button className="bg-white text-black hover:bg-gray-200">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            icon={<Repeat className="h-8 w-8 mb-4" />}
            title="Cross-Chain Swaps"
            description="Seamlessly swap tokens across different blockchain networks."
          />
          <FeatureCard
            icon={<Wallet className="h-8 w-8 mb-4" />}
            title="Web3React Integration"
            description="Connect your wallet easily and securely with Web3React."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8 mb-4" />}
            title="Real-Time Quotes"
            description="Get instant, real-time quotes for your token swaps."
          />
          <FeatureCard
            icon={<BarChart className="h-8 w-8 mb-4" />}
            title="Dynamic Chain Loading"
            description="Access a wide range of chains and tokens, loaded dynamically."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 mb-4" />}
            title="Non-Custodial"
            description="Maintain full control of your assets with our non-custodial solution."
          />
          <FeatureCard
            icon={<Repeat className="h-8 w-8 mb-4" />}
            title="Transaction Tracking"
            description="Monitor the status of your transactions in real-time."
          />
        </section>

        <section className="text-center bg-gray-900 rounded-lg p-8 mb-20">
          <h2 className="text-3xl font-bold mb-4">Ready to start swapping?</h2>
          <p className="text-gray-400 mb-6">
            Join thousands of users who trust TokenSwap for their cross-chain
            token swaps.
          </p>
          <Button className="bg-white text-black hover:bg-gray-200">
            Launch App
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-gray-600">
        <p>&copy; 2024 TokenSwap. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      {icon}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
