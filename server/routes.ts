import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.deployments.list.path, async (req, res) => {
    const items = await storage.getDeployments();
    res.json(items);
  });

  app.post(api.deployments.create.path, async (req, res) => {
    try {
      const input = api.deployments.create.input.parse(req.body);
      const deployment = await storage.createDeployment(input);
      res.status(201).json(deployment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
