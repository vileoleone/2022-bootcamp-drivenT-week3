import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createNewHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.company.companyName(),
      image: faker.internet.url()
    }
  });
}

export async function createRoomForHotel(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: faker.datatype.number(),
      hotelId: hotelId,
    },
  });
}
