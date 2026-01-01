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

export class CustomerEmailNotFoundException extends CustomBaseException {
  constructor(email: string) {
    super(`Customer with ID ${email} not found`, HttpStatus.NOT_FOUND);
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