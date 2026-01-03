import { Logger } from "@nestjs/common";

// class based logging Decorator
/*
    Usage example:
    @Injectable()
    @Log
    export class <Name>Service {}
*/
export function Log <T extends abstract new (...args: any[]) => object>( target: T ): T {
    target.prototype.log = new Logger(target.name);
    return target;
}