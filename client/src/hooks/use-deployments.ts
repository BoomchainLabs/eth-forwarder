import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertDeployment, type DeploymentsListResponse } from "@shared/schema";
import { z } from "zod";

export function useDeployments() {
  return useQuery({
    queryKey: [api.deployments.list.path],
    queryFn: async () => {
      const res = await fetch(api.deployments.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch deployments");
      const data = await res.json();
      return api.deployments.list.responses[200].parse(data);
    },
  });
}

export function useCreateDeployment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deployment: InsertDeployment) => {
      const validated = api.deployments.create.input.parse(deployment);
      const res = await fetch(api.deployments.create.path, {
        method: api.deployments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.deployments.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save deployment");
      }
      
      return api.deployments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.deployments.list.path] });
    },
  });
}
