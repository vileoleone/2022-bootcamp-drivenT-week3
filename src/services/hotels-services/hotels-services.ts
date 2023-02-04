import { hotelBody } from "@/protocols";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { notFoundError, unauthorizedError } from "@/repositories/errors";
import { paymentRequired } from "@/repositories/errors/payment-required";
import hotelsRepository from "@/repositories/hotel-repositories";
import ticketRepository from "@/repositories/ticket-repository";

async function allHotelService(userId: number) {
  if (!userId) {
    return unauthorizedError();
  }

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket ) {
    throw notFoundError();
  }

  if (ticket.status !== "PAID" || ticket.TicketType.isRemote === true || ticket.TicketType.includesHotel === false) {
    throw paymentRequired();
  }

  /*  console.log(ticket.TicketType.isRemote);
    console.log(ticket.TicketType.includesHotel); */

  const hotelsQueryResponse = await hotelsRepository.findMany();
  return hotelsQueryResponse;
}

async function hotelByIdService(userId: number, hotelId: number) {
  if (!userId) {
    return unauthorizedError();
  }

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.status !== "PAID" || ticket.TicketType.isRemote === true || ticket.TicketType.includesHotel === false) {
    throw paymentRequired();
  } 

  const hotelIdQueryResponse = await hotelsRepository.findHotelById(hotelId);
  
  return hotelIdQueryResponse;
}

function createHotelService(hotelBody: hotelBody) {
  const queryResponse = hotelsRepository.createHotel(hotelBody);

  return queryResponse;
}

const hotelService = {
  allHotelService, 
  hotelByIdService, 
  createHotelService
};

export default hotelService; 
