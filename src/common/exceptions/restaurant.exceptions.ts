import { HttpStatus } from "@nestjs/common";
import { CustomBaseException } from "./base.exception";

export class MenuItemNotFoundException extends CustomBaseException {
    constructor(id: string) {
        super(`MenuItem with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
} 

export class RestaurantNotFoundException extends CustomBaseException {
    constructor(id: string) {
        super(`Restaurant with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}

export class MenuItemNotAvailableException extends CustomBaseException {
    constructor(id: string) {
        super(`MenuItem with ID ${id} is not available`, HttpStatus.CONFLICT);
    }
}

export class InvalidPriceException extends CustomBaseException {
    constructor(message: string) {
        super(`Invalid price: ${message}`, HttpStatus.BAD_REQUEST);
    }
}

export class InvalidPreparationTimeException extends CustomBaseException {
    constructor(message: string) {
        super(`Invalid preparation time: ${message}`, HttpStatus.BAD_REQUEST);
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

export class MenuItemAlreadyExistsException extends CustomBaseException {
    constructor(name: string, restaurantId: string) {
        super(`MenuItem with name '${name}' already exists in restaurant ${restaurantId}`, HttpStatus.CONFLICT);
    }
}

export class RestaurantAlreadyExistsException extends CustomBaseException {
    constructor(name: string) {
        super(`Restaurant with name '${name}' already exists`, HttpStatus.CONFLICT);
    }
}

export class RestaurantEmailAlreadyExistsException extends CustomBaseException {
    constructor(email: string) {
        super(`Restaurant with email '${email}' already exists`, HttpStatus.CONFLICT);
    }
}