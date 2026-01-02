import { Global, Module } from "@nestjs/common";
import { UuidValidationPipe } from "./pipes/uuid-validation-pipe";
import { GlobalExceptionFilter } from "./filter/http-exception.filter";

@Global()
@Module({
    providers: [UuidValidationPipe, GlobalExceptionFilter],
    exports: [UuidValidationPipe, GlobalExceptionFilter]
})
export class CommonModule {}