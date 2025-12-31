import { HttpStatus } from "@nestjs/common";
import { CustomBaseException } from "./base.exception";

export class DriverNotFoundException extends CustomBaseException {
  constructor(id: string) {
    super(`Driver with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class DriverNotAvailableException extends CustomBaseException {
  constructor(id: string) {
    super(`Driver with ID ${id} is not available`, HttpStatus.CONFLICT);
  }
}

export class InvalidVehicleTypeException extends CustomBaseException {
  constructor(vehicleType: string) {
    super(`Invalid vehicle type: ${vehicleType}`, HttpStatus.BAD_REQUEST);
  }
}

export class DriverAlreadyExistsException extends CustomBaseException {
  constructor(email: string) {
    super(`Driver with email ${email} already exists`, HttpStatus.CONFLICT);
  }
}