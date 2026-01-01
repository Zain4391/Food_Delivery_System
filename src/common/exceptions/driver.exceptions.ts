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

export class DriverEmailNotFoundException extends CustomBaseException {
  constructor(email: string) {
    super(`Driver with email ${email} not found`, HttpStatus.NOT_FOUND);
  }
}

export class PasswordsNotMatchException extends CustomBaseException {
  constructor() {
    super('New password and confirm password do not match', HttpStatus.BAD_REQUEST);
  }
}

export class FileUploadException extends CustomBaseException {
  constructor(message: string) {
    super(`File upload failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class InvalidFileTypeException extends CustomBaseException {
  constructor(allowedTypes: string[]) {
    super(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, HttpStatus.BAD_REQUEST);
  }
}