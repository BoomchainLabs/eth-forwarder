import { DeployForm } from "@/components/deploy-form";
import { DeploymentHistory } from "@/components/deployment-history";
import { Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none -z-10" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {/* Header */}
        <header className="mb-12 max-w-2xl">
          <div className="inline-flex items-center justify-center p-2 bg-primary/5 rounded-2xl mb-4 border border-primary/10">
            <Zap className="w-6 h-6 text-primary fill-primary/20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            ETH Forwarder
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Deploy smart contracts that automatically forward incoming ETH to a specified recipient.
            Run locally in your browser with complete security.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-8">
            <DeployForm />
          </div>

          {/* Right Column: History */}
          <div className="lg:col-span-7 xl:col-span-8 h-[calc(100vh-12rem)] min-h-[600px]">
            <DeploymentHistory />
          </div>
          
        </div>
      </div>
    </div>
  );
}
