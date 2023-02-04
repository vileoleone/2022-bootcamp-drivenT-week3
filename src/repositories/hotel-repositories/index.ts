import { prisma } from "@/config";
import { hotelBody } from "@/protocols";

function findMany() {
  return prisma.hotel.findMany({});
}

function findHotelById(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId
    },
    include: {
      Rooms: true
    }
  });
}

function createHotel(body: hotelBody) {
  const { name, image } = body;
  return prisma.hotel.create({
    data: {
      name, image 
    }
  });
}

const hotelsRepository = {
  findMany, 
  findHotelById, 
  createHotel
};

export default hotelsRepository;
