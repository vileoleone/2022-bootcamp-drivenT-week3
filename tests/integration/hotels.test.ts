import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser, TicketTypeforHotel } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { createNewHotel, createRoomForHotel } from "../factories/hotels-factories";

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("/get/ hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.datatype.uuid();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 when there is no enrollment for given user", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 404 when there is no ticket for given user", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  }); 
  
  it("should respond with status 402 when ticket status is not paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();
    await createTicket(enrollment.id, ticketType.id, "RESERVED");

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 402 when ticket status is paid but isRemote is true adn includesHotel is true", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await TicketTypeforHotel(true, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 402 when ticket status is paid but includesHotel is false and isRemote  is false", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await TicketTypeforHotel(false, false);
    const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  }); 

  it("should respond with status 200 and hotel data when there is enrollment and ticket paid for given user", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await TicketTypeforHotel(false, true);
    await createTicket(enrollment.id, ticketType.id, "PAID");
    const hotel = await createNewHotel();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual([
      {
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
      },
    ]);
  });

  it("should respond with status 400 when there is no corresponding hotel for the given params", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await TicketTypeforHotel(false, true);
    await createTicket(enrollment.id, ticketType.id, "PAID");

    const response = await server.get("/hotels/x").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should respond with status 200 and hotel data including rooms rooms when there is enrollment and ticket paid for given user", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await TicketTypeforHotel(false, true);
    await createTicket(enrollment.id, ticketType.id, "PAID");
    const hotel = await createNewHotel();
    const hotelWithRooms = await createRoomForHotel(hotel.id);

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(
      {
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: hotelWithRooms.id,
            name: hotelWithRooms.name,
            capacity: hotelWithRooms.capacity,
            hotelId: hotelWithRooms.hotelId,
            createdAt: hotelWithRooms.createdAt.toISOString(),
            updatedAt: hotelWithRooms.updatedAt.toISOString(),
          },
        ],
      },
    );
  });
});
