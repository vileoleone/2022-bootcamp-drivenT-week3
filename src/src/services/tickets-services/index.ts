import { notFoundError } from "@/errors";
import { BadRequest } from "@/errors/bad-request";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/tickets-repositories";
import { TicketType } from "@prisma/client";

async function getTypeTicket(): Promise<TicketType[]> {
  const result = await ticketRepository.getTicketByType();
  if (!result) {
    return [];
  }
  return result;
}

async function getAllTicketsService(id: number) {
  const result = await ticketRepository.getAllTickets(id);

  if (!result) {
    throw notFoundError();
  }
  return result;
}

type ticketBody = {
  ticketTypeId: number,
  userId: number
};

async function createTicketService(body: ticketBody) {
  if (!body.ticketTypeId) {
    throw BadRequest();
  }

  const checkUser = await enrollmentRepository.findUserId(body.userId);

  if (!checkUser) {
    throw notFoundError();
  }
  const NewTicketToCreate = {
    ticketTypeId: body.ticketTypeId,
    enrollmentId: checkUser.id
  };

  const result = await ticketRepository.createATicket(NewTicketToCreate);
  return result;
}

const ticketService = {
  getTypeTicket,
  getAllTicketsService,
  createTicketService
};

export default ticketService;
