import { HttpStatus } from "@nestjs/common";
import { CustomBaseException } from "./base.exception";

export class DeliveryNotFoundException extends CustomBaseException {
    constructor(id: string) {
        super(`Delivery with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
}

export class DeliveryAlreadyExistsException extends CustomBaseException {
    constructor(orderId: string) {
        super(`Delivery for order ${orderId} already exists`, HttpStatus.CONFLICT);
    }
}

export class DeliveryAlreadyPickedUpException extends CustomBaseException {
    constructor(deliveryId: string) {
        super(`Delivery ${deliveryId} has already been picked up`, HttpStatus.CONFLICT);
    }
}

export class DeliveryAlreadyDeliveredException extends CustomBaseException {
    constructor(deliveryId: string) {
        super(`Delivery ${deliveryId} has already been delivered`, HttpStatus.CONFLICT);
    }
}

export class DeliveryNotPickedUpException extends CustomBaseException {
    constructor(deliveryId: string) {
        super(`Delivery ${deliveryId} must be picked up before it can be marked as delivered`, HttpStatus.BAD_REQUEST);
    }
}
