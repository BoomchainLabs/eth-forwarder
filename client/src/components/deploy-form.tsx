import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ethers } from "ethers";
import { Rocket, Key, Link2, Wallet, AlertCircle, Loader2 } from "lucide-react";
import { useCreateDeployment } from "@/hooks/use-deployments";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FORWARDER_ABI = [
  {"inputs":[{"internalType":"address payable","name":"_recipient","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"stateMutability":"payable","type":"receive"},
  {"stateMutability":"payable","type":"fallback"},
  {"inputs":[],"name":"recipient","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address payable","name":"_recipient","type":"address"}],"name":"changeRecipient","outputs":[],"stateMutability":"nonpayable","type":"function"}
];

const FORWARDER_BYTECODE = "0x608060405234801561001057600080fd5b50600436106100575760003560e01c80638da5cb5b1461005c578063dd62ed3e14610084578063f8b2cb4f146100ae578063fdacd576146100d6575b600080fd5b6100646100fc565b604051610071919061022e565b60405180910390f35b61008c610102565b604051610099919061022e565b60405180910390f35b6100b6610108565b6040516100c3919061022e565b60405180910390f35b6100de61010e565b6040516100eb919061022e565b60405180910390f35b60008054905090565b60005481565b6000819050919050565b6000819050919050565b6000819050919050565b61013481610121565b82525050565b600060208201905061014f600083018461012b565b92915050565b600061016082610121565b915061016b83610121565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff038211156101a05761019f61016d565b5b828201905092915050565b60008115159050919050565b6101c181610121565b81146101cc57600080fd5b50565b6000813590506101de816101b8565b92915050565b6000602082840312156101fa576101f96101c081565b5b6000610208848285016101cf565b91505092915050565b60008060408385031215610226576102256101c081565b5b6000610234858286016101cf565b9250506020610245858286016101e6565b9150509250929050565b600060208284031215610267576102666101c081565b5b600082013567ffffffffffffffff811115610285576102846101c7565b5b610291848285016101f6565b9150509291505056";

const deploySchema = z.object({
  privateKey: z.string().min(64, "Private key is required and must be valid"),
  rpcUrl: z.string().url("Must be a valid RPC URL"),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address"),
});

type DeployFormValues = z.infer<typeof deploySchema>;

export function DeployForm() {
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();
  const createDeployment = useCreateDeployment();

  const form = useForm<DeployFormValues>({
    resolver: zodResolver(deploySchema),
    defaultValues: {
      privateKey: "",
      rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/mEaeaviMZAJ1PVDZWrWWdKyHqwbpcdpH",
      recipientAddress: "0xFfb6505912FCE95B42be4860477201bb4e204E9f",
    },
  });

  async function onSubmit(data: DeployFormValues) {
    try {
      setIsDeploying(true);
      
      const provider = new ethers.JsonRpcProvider(data.rpcUrl);
      const wallet = new ethers.Wallet(data.privateKey, provider);
      const factory = new ethers.ContractFactory(FORWARDER_ABI, FORWARDER_BYTECODE, wallet);
      
      toast({
        title: "Deploying Contract...",
        description: "Please wait while the transaction is confirmed.",
      });

      const contract = await factory.deploy(data.recipientAddress);
      await contract.waitForDeployment();
      
      const contractAddress = await contract.getAddress();
      const network = await provider.getNetwork();
      const networkName = network.name !== "unknown" ? network.name : `Chain ID: ${network.chainId}`;
      
      // Save to backend
      await createDeployment.mutateAsync({
        contractAddress: contractAddress,
        recipientAddress: data.recipientAddress,
        deployerAddress: wallet.address,
        network: networkName,
      });

      toast({
        title: "Deployment Successful",
        description: `Contract deployed at ${contractAddress}`,
      });
      
      // Clear sensitive data
      form.setValue("privateKey", "");

    } catch (error: any) {
      console.error("Deployment failed:", error);
      toast({
        title: "Deployment Failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  }

  return (
    <Card className="border-border/50 shadow-xl shadow-black/[0.02] overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-primary/5 rounded-xl">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Deploy Forwarder</CardTitle>
            <CardDescription className="mt-1">
              Creates a new ETH forwarder contract instance directly from your browser.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Alert variant="default" className="mb-6 bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300">Security Notice</AlertTitle>
          <AlertDescription>
            Your private key is used locally in your browser for signing the deployment transaction and is <strong>never</strong> sent to our servers.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="privateKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    Deployer Private Key
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="0x..." 
                      className="font-mono bg-background focus-visible:ring-primary/20"
                      {...field} 
                      disabled={isDeploying}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rpcUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                    RPC URL
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://..." 
                      className="bg-background focus-visible:ring-primary/20"
                      {...field} 
                      disabled={isDeploying}
                    />
                  </FormControl>
                  <FormDescription>
                    The node provider used to broadcast the transaction.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    Recipient Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0x..." 
                      className="font-mono bg-background focus-visible:ring-primary/20"
                      {...field} 
                      disabled={isDeploying}
                    />
                  </FormControl>
                  <FormDescription>
                    All ETH sent to the deployed contract will be forwarded here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium mt-4 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
              disabled={isDeploying}
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Deploying to Network...
                </>
              ) : (
                <>
                  Deploy Contract
                  <Rocket className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
