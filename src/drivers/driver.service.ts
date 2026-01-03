import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeliveryDriver, VEHICLE_TYPE } from "./entities/driver.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { DriverPaginationDTO } from "./dtos/driver-pagination.dto";
import { paginate, Pagination, IPaginationOptions } from "nestjs-typeorm-paginate";
import { DriverResponseDTO } from "src/auth/dto/driver-response-dto";
import { plainToInstance } from "class-transformer";
import { DriverEmailNotFoundException, DriverNotFoundException, PasswordsNotMatchException, FileUploadException, InvalidFileTypeException } from "src/common/exceptions/driver.exceptions";
import { UpdateDriverDTO } from "./dtos/update-driver-dto";
import { ForgotPasswordDTO } from "./dtos/forgot-password.dto";
import { UpdatePasswordDTO } from "./dtos/update-password.dto";
import { InvalidCredentialsException } from "src/common/exceptions/auth.exceptions";
import { supabaseClient } from "src/config/supabase.config";
import { OrderService } from "src/orders/order.service";
import { OrderPaginationDTO } from "src/orders/dto/order-pagination.dto";
import { OrderResponseDTO } from "src/orders/dto/order-response.dto";
import { OrderStatus } from "src/orders/entities/order.entity";

@Injectable()
export class DriverService {

    constructor(
        @InjectRepository(DeliveryDriver)
        private driverRepository: Repository<DeliveryDriver>,
        private orderService: OrderService
    ) {}

    async findAll(query: DriverPaginationDTO): Promise<Pagination<DriverResponseDTO>> {

        const { page, limit, search, sortBy, sortOrder} = query;

        const queryBuilder = this.driverRepository.createQueryBuilder('driver');

        if (search) {
            queryBuilder.where(
                'driver.name ILIKE :search OR driver.email ILIKE :search OR driver.phone ILIKE :search',
                { search: `%${search}%`}
            );
        }

        // apply sorting
        if (sortBy && sortOrder) {
            queryBuilder.orderBy(`driver.${sortBy}`, sortOrder);
        }

        // paginated response
        const paginationOptions: IPaginationOptions = {
            page,
            limit
        };

        const result = await paginate<DeliveryDriver>(queryBuilder, paginationOptions);

        return {
            items: plainToInstance(DriverResponseDTO, result.items),
            meta: result.meta,
            links: result.links
        }
    }

    async findById(id: string): Promise<DriverResponseDTO> {

        const driver = await this.driverRepository.findOne({
            where: { id: id}
        });

        if (!driver) {
            throw new DriverNotFoundException(id);
        }

        return new DriverResponseDTO(driver);
    }

    async findByEmail(email: string): Promise<DriverResponseDTO> {

        const driver = await this.driverRepository.findOne({
            where: { email: email }
        });

        if (!driver) {
            throw new DriverEmailNotFoundException(email);
        }

        return new DriverResponseDTO(driver);
    }

    async findDeliveredOrders(driverId: string, query: OrderPaginationDTO): Promise<Pagination<OrderResponseDTO>> {
        
        const driver = await this.driverRepository.findOne({
            where: { id: driverId }
        });

        if (!driver) {
            throw new DriverNotFoundException(driverId);
        }

        // Set status filter to DELIVERED
        query.status = OrderStatus.DELIVERED;
        return this.orderService.findByDriver(driverId, query);
    }

    async findPendingOrders(driverId: string, query: OrderPaginationDTO): Promise<Pagination<OrderResponseDTO>> {
        
        const driver = await this.driverRepository.findOne({
            where: { id: driverId }
        });

        if (!driver) {
            throw new DriverNotFoundException(driverId);
        }

        // Set status filter to PICKED_UP (orders in transit)
        query.status = OrderStatus.PICKED_UP;
        return this.orderService.findByDriver(driverId, query);
    }

    async findAllDriverOrders(driverId: string, query: OrderPaginationDTO): Promise<Pagination<OrderResponseDTO>> {
        
        const driver = await this.driverRepository.findOne({
            where: { id: driverId }
        });

        if (!driver) {
            throw new DriverNotFoundException(driverId);
        }

        return this.orderService.findByDriver(driverId, query);
    }

    async update(updateDto: UpdateDriverDTO, id: string): Promise<DriverResponseDTO> {

        const driver = await this.driverRepository.findOne({
            where: { id: id }
        });

        if (!driver) {
            throw new DriverNotFoundException(id);
        }

        // Update driver with new data
        Object.assign(driver, updateDto);
        driver.updated_at = new Date();

        const updatedDriver = await this.driverRepository.save(driver);

        return new DriverResponseDTO(updatedDriver);
    }

    async updatePassword(updateDto: UpdatePasswordDTO, id: string): Promise<string> {
        const driver = await this.driverRepository.findOne({
            where: { id: id }
        });

        if (!driver) {
            throw new DriverNotFoundException(id);
        }

        const isValid = await bcrypt.compare(updateDto.currentPassword, driver.password);

        if(!isValid) {
            throw new InvalidCredentialsException();
        }

        if(updateDto.newPassword !== updateDto.confirmNewPassword) {
            throw new PasswordsNotMatchException();
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(updateDto.newPassword, 10);
        
        driver.password = hashedPassword;
        driver.updated_at = new Date();

        await this.driverRepository.save(driver);

        return 'Password updated successfully';
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDTO): Promise<string> {
        const driver = await this.driverRepository.findOne({
            where: { email: forgotPasswordDto.email }
        });

        if (!driver) {
            throw new DriverEmailNotFoundException(forgotPasswordDto.email);
        }

        if(forgotPasswordDto.newPassword !== forgotPasswordDto.confirmNewPassword) {
            throw new PasswordsNotMatchException();
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(forgotPasswordDto.newPassword, 10);
        
        driver.password = hashedPassword;
        driver.updated_at = new Date();

        await this.driverRepository.save(driver);

        return 'Password changed successfully';
    }

    async uploadProfileImage(id: string, file: Express.Multer.File): Promise<DriverResponseDTO> {
        // Validate driver exists
        const driver = await this.driverRepository.findOne({
            where: { id }
        });

        if (!driver) {
            throw new DriverNotFoundException(id);
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const mimeType = file.mimetype;
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new InvalidFileTypeException(allowedMimeTypes);
        }

        try {
            // Delete old profile image if exists
            if (driver.profile_image_url) {
                const oldFileName = driver.profile_image_url.split('/').pop();
                if (oldFileName) {
                    await supabaseClient.storage
                        .from('profile-banner-images')
                        .remove([`drivers/${oldFileName}`]);
                }
            }

            // Upload new image to Supabase Storage
            const fileName = `${id}-${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
            const fileBuffer = file.buffer;
            
            const { error: uploadError } = await supabaseClient.storage
                .from('profile-banner-images')
                .upload(`drivers/${fileName}`, fileBuffer, {
                    contentType: mimeType,
                    upsert: true
                });

            if (uploadError) {
                throw new FileUploadException(uploadError.message);
            }

            // Get public URL
            const { data: { publicUrl } } = supabaseClient.storage
                .from('profile-banner-images')
                .getPublicUrl(`drivers/${fileName}`);

            // Update driver record
            driver.profile_image_url = publicUrl;
            driver.updated_at = new Date();

            const updatedDriver = await this.driverRepository.save(driver);
            return new DriverResponseDTO(updatedDriver);

        } catch (error: unknown) {
            if (error instanceof FileUploadException || error instanceof InvalidFileTypeException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during file upload';
            throw new FileUploadException(errorMessage);
        }
    }

    async changeVehicle(id: string, type: VEHICLE_TYPE): Promise<DriverResponseDTO> {

        const driver = await this.driverRepository.findOne({
            where: { id: id }
        });

        if (!driver) {
            throw new DriverNotFoundException(id);
        }

        driver.vehicle_type = type;
        const savedDriver = await this.driverRepository.save(driver);

        return new DriverResponseDTO(savedDriver);
    }

    async remove(id: string): Promise<string> {

        const driver = await this.driverRepository.findOne({
            where: { id: id }
        });

        if(!driver) {
            throw new DriverNotFoundException(id);
        }

        await this.driverRepository.remove(driver);
        return `Driver with ID: ${id} deleted successfully`;
    }

    async toggleAvailability(id: string): Promise<DriverResponseDTO> {

        const driver = await this.driverRepository.findOne({
            where: { id: id }
        });

        if (!driver) {
            throw new DriverNotFoundException(id);
        }

        driver.is_available = !driver.is_available;
        driver.updated_at = new Date();

        const savedDriver = await this.driverRepository.save(driver);

        return new DriverResponseDTO(savedDriver);
    }
}