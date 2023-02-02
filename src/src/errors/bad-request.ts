import { ApplicationError } from "@/protocols";

export function BadRequest(): ApplicationError {
  return {
    name: "BadRequest",
    message: "Body Invalid for post request",
  };
}
