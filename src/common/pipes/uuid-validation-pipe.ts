import { ArgumentMetadata, BadRequestException, Injectable, Logger, PipeTransform } from "@nestjs/common";
import { validate } from "uuid";

@Injectable()
export class UuidValidationPipe implements PipeTransform<string, string> {

    private readonly logger = new Logger(UuidValidationPipe.name);

    transform(value: string, metadata: ArgumentMetadata): string {
        if(!value) {
            this.logger.error(`No value found value: ${value}, with metadata: ${metadata.data}, ${metadata.type}`);
            throw new BadRequestException("ID parameter is required!");
        }

        if(!validate(value)) {
            this.logger.error(`Incorret UUID format: ${value}, with metadata: ${metadata.data}, ${metadata.type}`);
            throw new BadRequestException("Invalid UUID format");
        }

        return value;
    }
}