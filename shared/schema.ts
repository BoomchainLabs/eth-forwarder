import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  contractAddress: text("contract_address").notNull(),
  recipientAddress: text("recipient_address").notNull(),
  deployerAddress: text("deployer_address").notNull(),
  network: text("network").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({ id: true, createdAt: true });

export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type DeploymentResponse = Deployment;
export type DeploymentsListResponse = Deployment[];
