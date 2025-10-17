import type { Request, Response } from "express";

export function health(req: Request, res: Response) {
  const startTime = Date.now();
   const uptime = (Date.now() - startTime) / 1000; 

  res.status(200).json({
    status: "OK",
    uptime: `${uptime.toFixed(2)}s`,
    timestamp: new Date().toISOString(),
  });
}