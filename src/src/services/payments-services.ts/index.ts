import { notFoundError, unauthorizedError } from "@/errors";
import { BadRequest } from "@/errors/bad-request";
import { data, paymentProcess } from "@/protocols";
import enrollmentRepository from "@/repositories/enrollment-repository";
import paymentsepository from "@/repositories/payments-repositories.ts";
import ticketRepository from "@/repositories/tickets-repositories";
import { Payment } from "@prisma/client";

async function PaymentServiceByTicketId(ticketId: number, userId: number): Promise<Payment> {
  const enrollment = await enrollmentRepository.findUserId(userId);
  const ticket = await ticketRepository.getATicket(ticketId);

  if (!ticket) {
    throw notFoundError();
  }

  if (enrollment.id !== ticket.enrollmentId) {
    throw unauthorizedError();
  }

  const resultPayment = await paymentsepository.findPaymentByTicketiD(ticketId);

  return resultPayment;
}

async function createPaymentService(body: paymentProcess & {userId: number}): Promise<Payment> {
  const { ticketId, cardData, userId } = body;

  const ticket = await ticketRepository.getATicket(ticketId);

  if (!ticket) {
    throw notFoundError();
  }

  const enrollment = await enrollmentRepository.findUserId(userId);
  
  if (enrollment.id !== ticket.enrollmentId) {
    throw unauthorizedError();
  }

  const ticketAfterUpdate = await ticketRepository.updateTicketAfterPayment(ticketId);

  const paymentData: data = {
    ticketId,
    value: ticketAfterUpdate.TicketType.price,
    cardIssuer: cardData.issuer,
    cardLastDigits: cardData.number.toString().slice(-4)
  };
  const payment = await paymentsepository.createPaymentRepository(paymentData);
  return payment;
}
 
const paymentService = {
  PaymentServiceByTicketId,
  createPaymentService,
};

export default paymentService;
