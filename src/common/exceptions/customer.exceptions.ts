import { HttpStatus } from '@nestjs/common';
import { CustomBaseException } from './base.exception';

export class CustomerNotFoundException extends CustomBaseException {
  constructor(id: string) {
    super(`Customer with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class InvalidCustomerDataException extends CustomBaseException {
  constructor(message: string) {
    super(`Invalid customer data: ${message}`, HttpStatus.BAD_REQUEST);
  }
}

export class CustomerAlreadyExistsException extends CustomBaseException {
  constructor(email: string) {
    super(`Customer with email ${email} already exists`, HttpStatus.CONFLICT);
  }
}