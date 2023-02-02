import { AuthenticatedRequest } from "@/middlewares";
import paymentService from "@/services/payments-services.ts";
import { Response } from "express";
import httpStatus from "http-status";

export async function getPayment(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketId } = req.query;
  if (!ticketId) {
    res.sendStatus(httpStatus.BAD_REQUEST);
  }
  
  try {
    const result = await paymentService.PaymentServiceByTicketId(Number(ticketId), userId);
    
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.name === "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND);
    if (error.name === "UnauthorizedError") return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export async function createPayment(req: AuthenticatedRequest, res: Response) {
  const { ticketId, cardData } = req.body;

  if (!ticketId || !cardData) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
  
  try {
    const payment = await paymentService.createPaymentService({
      ...req.body,
      userId: req.userId,
    });

    return res.status(httpStatus.OK).send(payment); 
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.status(httpStatus.NOT_FOUND).send(error.message);
    }
    if (error.name === "badRequest") {
      return res.status(httpStatus.BAD_REQUEST).send(error.message);
    }
    if (error.name === "UnauthorizedError") {
      return res.status(httpStatus.UNAUTHORIZED).send(error.message);
    }
  }
}
