import { HttpStatus } from "@nestjs/common";
import { CustomBaseException } from "./base.exception";

export class OrderNotFoundException extends CustomBaseException {
    constructor(id: string) {
        super(`Order with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}

export class InvalidOrderStatusException extends CustomBaseException {
    constructor(currentStatus: string, newStatus: string) {
        super(`Cannot change order status from ${currentStatus} to ${newStatus}`, HttpStatus.BAD_REQUEST);
    }
}

export class EmptyOrderException extends CustomBaseException {
    constructor() {
        super('Order must contain at least one item', HttpStatus.BAD_REQUEST);
    }
}

export class InvalidQuantityException extends CustomBaseException {
    constructor(message: string) {
        super(`Invalid quantity: ${message}`, HttpStatus.BAD_REQUEST);
    }
}

export class MenuItemNotAvailableForOrderException extends CustomBaseException {
    constructor(itemId: string) {
        super(`Menu item with ID ${itemId} is not available for ordering`, HttpStatus.CONFLICT);
    }
}

export class DriverNotAvailableException extends CustomBaseException {
    constructor(driverId: string) {
        super(`Driver with ID ${driverId} is not available`, HttpStatus.CONFLICT);
    }
}

export class RestaurantNotActiveException extends CustomBaseException {
    constructor(restaurantId: string) {
        super(`Restaurant with ID ${restaurantId} is not currently accepting orders`, HttpStatus.CONFLICT);
    }
}

export class OrderAlreadyCancelledException extends CustomBaseException {
    constructor(orderId: string) {
        super(`Order with ID ${orderId} has already been cancelled`, HttpStatus.CONFLICT);
    }
}

export class OrderAlreadyDeliveredException extends CustomBaseException {
    constructor(orderId: string) {
        super(`Order with ID ${orderId} has already been delivered`, HttpStatus.CONFLICT);
    }
}
