import { HttpStatus } from '@nestjs/common';
import { CustomBaseException } from './base.exception';

export class InvalidCredentialsException extends CustomBaseException {
  constructor() {
    super('Invalid email or password', HttpStatus.UNAUTHORIZED);
  }
}

export class EmailAlreadyExistsException extends CustomBaseException {
  constructor(email: string) {
    super(`Email ${email} is already registered`, HttpStatus.CONFLICT);
  }
}

export class TokenExpiredException extends CustomBaseException {
  constructor() {
    super('Your session has expired. Please login again', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidTokenException extends CustomBaseException {
  constructor() {
    super('Invalid authentication token', HttpStatus.UNAUTHORIZED);
  }
}

export class UnauthorizedAccessException extends CustomBaseException {
  constructor(resource?: string) {
    super(
      resource 
        ? `You are not authorized to access ${resource}` 
        : 'You are not authorized to perform this action',
      HttpStatus.FORBIDDEN,
    );
  }
}