import { createPayment, getPayment } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const paymentsRouter = Router();

paymentsRouter
  .use(authenticateToken)
  .get("/", getPayment)
  .post("/process", createPayment);

export default paymentsRouter;
