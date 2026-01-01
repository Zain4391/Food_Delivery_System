import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "./entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { CustomerPaginationDTO } from "./dtos/customer-pagination.dto";
import { paginate, Pagination, IPaginationOptions } from "nestjs-typeorm-paginate";
import { CustomerResponseDTO } from "src/auth/dto/customer-response-dto";
import { plainToInstance } from "class-transformer";
import { CustomerEmailNotFoundException, CustomerNotFoundException, PasswordsNotMatchException, FileUploadException, InvalidFileTypeException } from "src/common/exceptions/customer.exceptions";
import { UpdateCustomerDTO } from "./dtos/update-customer.dto";
import { ForgotPasswordDTO } from "./dtos/forgot-password.dto";
import { UpdatePasswordDTO } from "./dtos/update-password.dto";
import { InvalidCredentialsException } from "src/common/exceptions/auth.exceptions";
import { supabaseClient } from "src/config/supabase.config";
import { OrderService } from "src/orders/order.service";
import { OrderPaginationDTO } from "src/orders/dto/order-pagination.dto";
import { OrderResponseDTO } from "src/orders/dto/order-response.dto";

@Injectable()
export class CustomerService {

    constructor(
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        private orderService: OrderService
    ) {}

    async findAll(query: CustomerPaginationDTO): Promise<Pagination<CustomerResponseDTO>> {

        const { page, limit, search, sortBy, sortOrder} = query;

        const queryBuilder = this.customerRepository.createQueryBuilder('customer');

        if (search) {
            queryBuilder.where(
                'customer.name ILIKE :search OR customer.email ILIKE :search OR customer.address ILIKE :search',
                { search: `%${search}}%`}
            );
        }

        // apply sorting
        if (sortBy && sortOrder) {
            queryBuilder.orderBy(`customer.${sortBy}`, sortOrder);
        }

        // paginated response
        const paginationOptions: IPaginationOptions = {
            page,
            limit
        };

        const result = await paginate<Customer>(queryBuilder, paginationOptions);

        return {
            items: plainToInstance(CustomerResponseDTO, result.items),
            meta: result.meta,
            links: result.links
        }
    }

    async findById(id: string): Promise<CustomerResponseDTO> {

        const customer = await this.customerRepository.findOne({
            where: { id: id}
        });

        if (!customer) {
            throw new CustomerNotFoundException(id);
        }

        return new CustomerResponseDTO(customer);
    }

    async findByEmail(email: string): Promise<CustomerResponseDTO> {

        const customer = await this.customerRepository.findOne({
            where: { email: email }
        });

        if (!customer) {
            throw new CustomerEmailNotFoundException(email);
        }

        return new CustomerResponseDTO(customer);
    }
    
    async findUserOrders(customerId: string, query: OrderPaginationDTO): Promise<Pagination<OrderResponseDTO>> {
        // Validate customer exists
        const customer = await this.customerRepository.findOne({
            where: { id: customerId }
        });

        if (!customer) {
            throw new CustomerNotFoundException(customerId);
        }

        return this.orderService.findByCustomer(customerId, query);
    }

    async update(updateDto: UpdateCustomerDTO, id: string): Promise<CustomerResponseDTO> {

        const customer = await this.customerRepository.findOne({
            where: { id: id }
        });

        if (!customer) {
            throw new CustomerNotFoundException(id);
        }

        // Update customer with new data
        Object.assign(customer, updateDto);
        customer.updated_at = new Date();

        const updatedCustomer = await this.customerRepository.save(customer);

        return new CustomerResponseDTO(updatedCustomer);
    }

    async updatePassword(updateDto: UpdatePasswordDTO, id: string): Promise<string> {
        const customer = await this.customerRepository.findOne({
            where: { id: id }
        });

        if (!customer) {
            throw new CustomerNotFoundException(id);
        }

        const isValid = await bcrypt.compare(updateDto.currentPassword, customer.password);

        if(!isValid) {
            throw new InvalidCredentialsException();
        }

        if(updateDto.newPassword !== updateDto.confirmNewPassword) {
            throw new PasswordsNotMatchException();
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(updateDto.newPassword, 10);
        
        customer.password = hashedPassword;
        customer.updated_at = new Date();

        await this.customerRepository.save(customer);

        return 'Password updated successfully';
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDTO): Promise<string> {
        const customer = await this.customerRepository.findOne({
            where: { email: forgotPasswordDto.email }
        });

        if (!customer) {
            throw new CustomerEmailNotFoundException(forgotPasswordDto.email);
        }


        if(forgotPasswordDto.newPassword !== forgotPasswordDto.confirmNewPassword) {
            throw new PasswordsNotMatchException();
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(forgotPasswordDto.newPassword, 10);
        
        customer.password = hashedPassword;
        customer.updated_at = new Date();

        await this.customerRepository.save(customer);

        return 'Password changed successfully';
    }

    async uploadProfileImage(id: string, file: Express.Multer.File): Promise<CustomerResponseDTO> {
        // Validate customer exists
        const customer = await this.customerRepository.findOne({
            where: { id }
        });

        if (!customer) {
            throw new CustomerNotFoundException(id);
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const mimeType = file.mimetype;
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new InvalidFileTypeException(allowedMimeTypes);
        }

        try {
            // Delete old profile image if exists
            if (customer.profile_image_url) {
                const oldFileName = customer.profile_image_url.split('/').pop();
                if (oldFileName) {
                    await supabaseClient.storage
                        .from('profile-banner-images')
                        .remove([`customers/${oldFileName}`]);
                }
            }

            // Upload new image to Supabase Storage
            const fileName = `${id}-${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
            const fileBuffer = file.buffer;
            
            const { error: uploadError } = await supabaseClient.storage
                .from('profile-banner-images')
                .upload(`customers/${fileName}`, fileBuffer, {
                    contentType: mimeType,
                    upsert: true
                });

            if (uploadError) {
                throw new FileUploadException(uploadError.message);
            }

            // Get public URL
            const { data: { publicUrl } } = supabaseClient.storage
                .from('profile-banner-images')
                .getPublicUrl(`customers/${fileName}`);

            // Update customer record
            customer.profile_image_url = publicUrl;
            customer.updated_at = new Date();

            const updatedCustomer = await this.customerRepository.save(customer);
            return new CustomerResponseDTO(updatedCustomer);

        } catch (error: unknown) {
            if (error instanceof FileUploadException || error instanceof InvalidFileTypeException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during file upload';
            throw new FileUploadException(errorMessage);
        }
    }

    async remove(id: string): Promise<string> {

        const customer = await this.customerRepository.findOne({
            where: { id: id }
        });

        if(!customer) {
            throw new CustomerNotFoundException(id);
        }

        await this.customerRepository.remove(customer);
        return `Customer with ID: ${id} deleted successfully`;
    }
}