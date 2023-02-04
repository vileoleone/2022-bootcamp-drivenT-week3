import { AuthenticatedRequest } from "@/middlewares";
import { hotelBody } from "@/protocols";
import { Response } from "express";
import httpStatus from "http-status";
import hotelService from "../services/hotels-services/hotels-services";

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const response = await hotelService.allHotelService(userId);
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    }

    if (error.name === "payment-required") {
      res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function hotelById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params; 

  try {
    const response = await hotelService.hotelByIdService(userId, Number(hotelId));
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    if (error.name === "UnauthorizedError") {
      res.sendStatus(httpStatus.UNAUTHORIZED);
    }
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    }

    if (error.name === "payment-required") {
      res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function createNewHotel(req: AuthenticatedRequest, res: Response) {
  const hotelBody: hotelBody = req.body;

  try {
    const result = await hotelService.createHotelService(hotelBody);

    res.status(httpStatus.OK).send(result);
  } catch (error) {
    res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
