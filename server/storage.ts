import { db } from "./db";
import { deployments, type InsertDeployment, type Deployment } from "@shared/schema";

export interface IStorage {
  getDeployments(): Promise<Deployment[]>;
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
}

export class DatabaseStorage implements IStorage {
  async getDeployments(): Promise<Deployment[]> {
    return await db.select().from(deployments);
  }

  async createDeployment(insertDeployment: InsertDeployment): Promise<Deployment> {
    const [deployment] = await db.insert(deployments).values(insertDeployment).returning();
    return deployment;
  }
}

export const storage = new DatabaseStorage();
