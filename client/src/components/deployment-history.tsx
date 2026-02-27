import { format } from "date-fns";
import { CheckCircle2, Copy, ExternalLink, History, FileCode, SearchX } from "lucide-react";
import { useDeployments } from "@/hooks/use-deployments";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function DeploymentHistory() {
  const { data: deployments, isLoading, error } = useDeployments();
  const { toast } = useToast();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully.`,
      duration: 2000,
    });
  };

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="border-border/50 shadow-xl shadow-black/[0.02] h-full flex flex-col">
      <CardHeader className="bg-muted/30 border-b border-border/50 pb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/5 rounded-xl">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Deployment History</CardTitle>
            <CardDescription className="mt-1">
              Record of your previously deployed forwarder contracts.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-3 p-4 rounded-xl border border-border/40">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <SearchX className="w-12 h-12 text-destructive/50 mb-4" />
            <h3 className="text-lg font-medium">Failed to load history</h3>
            <p className="text-muted-foreground mt-2 max-w-[250px]">
              We couldn't retrieve your past deployments. Please try again later.
            </p>
          </div>
        ) : deployments && deployments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <FileCode className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-medium">No deployments yet</h3>
            <p className="text-muted-foreground mt-2 max-w-[280px]">
              Deploy your first contract using the form to see it appear here.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {deployments?.map((deployment) => (
              <div 
                key={deployment.id} 
                className="group relative bg-card p-5 rounded-xl border border-border/50 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm text-foreground">Success</span>
                    <Badge variant="secondary" className="ml-2 bg-primary/5 hover:bg-primary/10 text-xs font-normal border-none text-primary">
                      {deployment.network}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {deployment.createdAt ? format(new Date(deployment.createdAt), "MMM d, yyyy 'at' h:mm a") : "Unknown date"}
                  </span>
                </div>

                <div className="grid gap-3">
                  <div className="bg-muted/40 rounded-lg p-3 border border-border/30">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contract Address</span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => handleCopy(deployment.contractAddress, "Contract Address")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="font-mono text-sm break-all font-medium text-foreground">
                      {deployment.contractAddress}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/20 rounded-lg p-3 border border-border/20">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Recipient</div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-foreground/80" title={deployment.recipientAddress}>
                          {shortenAddress(deployment.recipientAddress)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 -mr-1"
                          onClick={() => handleCopy(deployment.recipientAddress, "Recipient Address")}
                        >
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 rounded-lg p-3 border border-border/20">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Deployer</div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-foreground/80" title={deployment.deployerAddress}>
                          {shortenAddress(deployment.deployerAddress)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 -mr-1"
                          onClick={() => handleCopy(deployment.deployerAddress, "Deployer Address")}
                        >
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
