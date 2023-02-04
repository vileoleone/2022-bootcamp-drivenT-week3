import { authenticateToken } from "@/middlewares";
import { createNewHotel, getAllHotels, hotelById } from "controllers/hotels-controller";
import { Router } from "express";

const hotelRouter = Router();

hotelRouter
  .all("/*", authenticateToken)
  .get("/", getAllHotels)
  .get("/:hotelId", hotelById)
  .post("/", createNewHotel);

export { hotelRouter };
