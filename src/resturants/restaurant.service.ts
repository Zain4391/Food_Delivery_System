import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MenuItem } from "./entities/menu-item.entity";
import { Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { MenuItemPaginationDTO } from "./dto/menu-item-pagination.dto";
import { IPaginationOptions, paginate, Pagination } from "nestjs-typeorm-paginate";
import { plainToInstance } from "class-transformer";
import { MenuItemResponseDTO } from "./dto/menu-item-response.dto";
import { RestaurantResponseDTO } from "./dto/restaurant-response.dto";
import { MenuItemNotFoundException, RestaurantNotFoundException, InvalidPriceException, InvalidPreparationTimeException, MenuItemAlreadyExistsException, InvalidFileTypeException, FileUploadException, RestaurantAlreadyExistsException, RestaurantEmailAlreadyExistsException } from "src/common/exceptions/restaurant.exceptions";
import { CreateMenuItemDTO } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDTO } from "./dto/update-menu-item.dto";
import { UpdateRestaurantDTO } from "./dto/update-restaurant.dto";
import { CreateRestaurantDTO } from "./dto/create-restaurant.dto";
import { RestaurantPaginationDTO } from "./dto/restaurant-pagination.dto";
import { supabaseClient } from "src/config/supabase.config";

@Injectable()
export class RestaurantService {

    constructor(
        @InjectRepository(MenuItem)
        private menuItemRepository: Repository<MenuItem>,
        @InjectRepository(Restaurant)
        private restaurantRepository: Repository<Restaurant>
    ) {}

    // Menu Items Related
    async findAll(restaurantId: string, query: MenuItemPaginationDTO): Promise<Pagination<MenuItemResponseDTO>> {
        
        const restaurant = await this.restaurantRepository.findOne({
            where: { id: restaurantId } 
        });

        if (!restaurant) {
            throw new RestaurantNotFoundException(restaurantId);
        }
        
        const { page, limit, search, category, minPrice, maxPrice, minPrepTime, maxPrepTime, sortBy, sortOrder} = query;

        const queryBuilder = this.menuItemRepository.createQueryBuilder('menuItem');

        // filter by restaurant
        queryBuilder.where("menuItem.restaurant_id = :restaurantId", { restaurantId });

        if (search) {
            queryBuilder.andWhere(
                'menuItem.name ILIKE :search OR menuItem.description ILIKE :search',
                { search: `%${search}%`}
            )
        }

        if (category) {
            queryBuilder.andWhere('menuItem.category = :category', { category });
        }

        if (minPrice !== undefined) {
            queryBuilder.andWhere('menuItem.price >= :minPrice', { minPrice });
        }

        if (maxPrice !== undefined) {
            queryBuilder.andWhere('menuItem.price <= :maxPrice', { maxPrice });
        }

        if (minPrepTime !== undefined) {
            queryBuilder.andWhere('menuItem.preparation_time >= :minPrepTime', { minPrepTime });
        }

        if (maxPrepTime !== undefined) {
            queryBuilder.andWhere('menuItem.preparation_time <= :maxPrepTime', { maxPrepTime });
        }

        if (sortBy && sortOrder) {
            queryBuilder.orderBy(`menuItem.${sortBy}`, sortOrder);
        }

        const paginationOption: IPaginationOptions = {
            page,
            limit
        }

        const result = await paginate<MenuItem>(queryBuilder, paginationOption);

        return {
            items: plainToInstance(MenuItemResponseDTO, result.items),
            meta: result.meta,
            links: result.links
        }
    }

    async findById(id: string): Promise<MenuItemResponseDTO> {

        const item = await this.menuItemRepository.findOne({
            where: { id: id }
        });

        if (!item) {
            throw new MenuItemNotFoundException(id);
        }

        return new MenuItemResponseDTO(item);
    }

    async create(restaurantId: string, createDto: CreateMenuItemDTO): Promise<MenuItemResponseDTO> {

        const restaurant = await this.restaurantRepository.findOne({
            where: { id: restaurantId }
        });

        if( !restaurant) {
            throw new RestaurantNotFoundException(restaurantId);
        }

        const item = this.menuItemRepository.create({
            ...createDto,
            created_at: new Date()
        });

        const savedItem = await this.menuItemRepository.save(item);
        return new MenuItemResponseDTO(savedItem);
    }

    async update(id: string, updateDto: UpdateMenuItemDTO): Promise<MenuItemResponseDTO> {

        const item = await this.menuItemRepository.findOne({
            where: { id: id }
        });

        if (!item) {
            throw new MenuItemNotFoundException(id);
        }

        // Validate price if being updated
        if (updateDto.price !== undefined && updateDto.price <= 0) {
            throw new InvalidPriceException('Price must be greater than 0');
        }

        // Validate preparation time if being updated
        if (updateDto.preparation_time !== undefined && updateDto.preparation_time < 1) {
            throw new InvalidPreparationTimeException('Preparation time must be at least 1 minute');
        }

        // Check for duplicate name in same restaurant if name is being updated
        if (updateDto.name && updateDto.name !== item.name) {
            const existingItem = await this.menuItemRepository.findOne({
                where: {
                    name: updateDto.name,
                    restaurant_id: item.restaurant_id
                }
            });

            if (existingItem) {
                throw new MenuItemAlreadyExistsException(updateDto.name, item.restaurant_id);
            }
        }

        // update with new data
        Object.assign(item, updateDto);
        item.updated_at = new Date();

        const savedItem = await this.menuItemRepository.save(item);
        return new MenuItemResponseDTO(savedItem);
    }

    async remove(id: string) : Promise<string> {

        const item = await this.menuItemRepository.findOne({
            where: { id: id }
        });

        if (!item) {
            throw new MenuItemNotFoundException(id);
        }

        await this.menuItemRepository.remove(item);
        return `Menu Item: ${item.name} removed successfully`;
    }

    async toggleAvailability(id: string): Promise<MenuItemResponseDTO> {

        const item = await this.menuItemRepository.findOne({
            where: { id: id }
        });

        if (!item) {
            throw new MenuItemNotFoundException(id);
        }

        item.is_available = !item.is_available;
        item.updated_at = new Date();

        const savedItem = await this.menuItemRepository.save(item);
        return new MenuItemResponseDTO(savedItem);
    }

    async findAvailableItems(restaurantId: string, query: MenuItemPaginationDTO): Promise<Pagination<MenuItemResponseDTO>> {
        
        // Verify restaurant exists
        const restaurant = await this.restaurantRepository.findOne({
            where: { id: restaurantId }
        });

        if (!restaurant) {
            throw new RestaurantNotFoundException(restaurantId);
        }

        const { page, limit, search, category, minPrice, maxPrice, minPrepTime, maxPrepTime, sortBy, sortOrder } = query;

        const queryBuilder = this.menuItemRepository.createQueryBuilder('menuItem');

        // Filter by restaurant and availability
        queryBuilder.where('menuItem.restaurant_id = :restaurantId', { restaurantId });
        queryBuilder.andWhere('menuItem.is_available = :isAvailable', { isAvailable: true });

        if (search) {
            queryBuilder.andWhere(
                '(menuItem.name ILIKE :search OR menuItem.description ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (category) {
            queryBuilder.andWhere('menuItem.category = :category', { category });
        }

        if (minPrice !== undefined) {
            queryBuilder.andWhere('menuItem.price >= :minPrice', { minPrice });
        }

        if (maxPrice !== undefined) {
            queryBuilder.andWhere('menuItem.price <= :maxPrice', { maxPrice });
        }

        if (minPrepTime !== undefined) {
            queryBuilder.andWhere('menuItem.preparation_time >= :minPrepTime', { minPrepTime });
        }

        if (maxPrepTime !== undefined) {
            queryBuilder.andWhere('menuItem.preparation_time <= :maxPrepTime', { maxPrepTime });
        }

        if (sortBy && sortOrder) {
            queryBuilder.orderBy(`menuItem.${sortBy}`, sortOrder);
        }

        const paginationOption: IPaginationOptions = {
            page,
            limit
        };

        const result = await paginate<MenuItem>(queryBuilder, paginationOption);

        return {
            items: plainToInstance(MenuItemResponseDTO, result.items),
            meta: result.meta,
            links: result.links
        };
    }

    async uploadMenuItemImage(id: string, file: Express.Multer.File): Promise<MenuItemResponseDTO> {

        const item = await this.menuItemRepository.findOne({
            where: { id: id }
        });

        if (!item) {
            throw new MenuItemNotFoundException(id);
        }

        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const mimeType = file.mimetype;
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new InvalidFileTypeException(allowedMimeTypes);
        }

        try {
            if (item.image_url) {
                const oldFileName = item.image_url.split('/').pop();
                if(oldFileName) {
                    await supabaseClient.storage
                          .from('profile-banner-images')
                          .remove([`menuItems/${oldFileName}`]);
                }
            }

            const fileName = `${id}-${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
            const fileBuffer = file.buffer;

            const { error: uploadError } = await supabaseClient.storage.from('profile-banner-images').upload(`menuItems/${fileName}`, fileBuffer, {
                contentType: mimeType,
                upsert: true
            });

            if (uploadError) {
                throw new FileUploadException(uploadError.message);
            }

            const { data: { publicUrl } } = supabaseClient.storage
                .from('profile-banner-images')
                .getPublicUrl(`menuItems/${fileName}`);

            // Update menuItem record
            item.image_url = publicUrl;
            item.updated_at = new Date();

            const updatedItem = await this.menuItemRepository.save(item);
            return new MenuItemResponseDTO(updatedItem);
            
        } catch (error: unknown) {
            if (error instanceof FileUploadException || error instanceof InvalidFileTypeException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during file upload';
            throw new FileUploadException(errorMessage);
        }
    }

    async uploadRestaurantImage(id: string, file: Express.Multer.File, imageType: 'logo' | 'banner'): Promise<RestaurantResponseDTO> {

        const restaurant = await this.restaurantRepository.findOne({
            where: { id: id }
        });

        if (!restaurant) {
            throw new RestaurantNotFoundException(id);
        }

        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const mimeType = file.mimetype;
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new InvalidFileTypeException(allowedMimeTypes);
        }

        try {
            // Determine which field to update and the storage path
            const fieldName = imageType === 'logo' ? 'logo_url' : 'banner_url';
            const storagePath = imageType === 'logo' ? 'restaurants/logos' : 'restaurants/banners';
            const currentImageUrl = restaurant[fieldName];

            // Delete old image if exists
            if (currentImageUrl) {
                const oldFileName = currentImageUrl.split('/').pop();
                if (oldFileName) {
                    await supabaseClient.storage
                        .from('profile-banner-images')
                        .remove([`${storagePath}/${oldFileName}`]);
                }
            }

            const fileName = `${id}-${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
            const fileBuffer = file.buffer;

            const { error: uploadError } = await supabaseClient.storage
                .from('profile-banner-images')
                .upload(`${storagePath}/${fileName}`, fileBuffer, {
                    contentType: mimeType,
                    upsert: true
                });

            if (uploadError) {
                throw new FileUploadException(uploadError.message);
            }

            const { data: { publicUrl } } = supabaseClient.storage
                .from('profile-banner-images')
                .getPublicUrl(`${storagePath}/${fileName}`);

            // Update restaurant record with the appropriate field
            restaurant[fieldName] = publicUrl;
            restaurant.updated_at = new Date();

            const updatedRestaurant = await this.restaurantRepository.save(restaurant);
            return new RestaurantResponseDTO(updatedRestaurant);

        } catch (error: unknown) {
            if (error instanceof FileUploadException || error instanceof InvalidFileTypeException) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during file upload';
            throw new FileUploadException(errorMessage);
        }
    }

    // restaurant related
    async findAllRestaurants(query: RestaurantPaginationDTO): Promise<Pagination<RestaurantResponseDTO>> {
        
        const { page, limit, search, cusine_type, minRating, is_active, sortBy, sortOrder } = query;

        const queryBuilder = this.restaurantRepository.createQueryBuilder('restaurant');

        if (search) {
            queryBuilder.where(
                '(restaurant.name ILIKE :search OR restaurant.description ILIKE :search OR restaurant.address ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (cusine_type) {
            queryBuilder.andWhere('restaurant.cusine_type = :cusine_type', { cusine_type });
        }

        if (minRating !== undefined) {
            queryBuilder.andWhere('restaurant.rating >= :minRating', { minRating });
        }

        if (is_active !== undefined) {
            queryBuilder.andWhere('restaurant.is_active = :is_active', { is_active });
        }

        if (sortBy && sortOrder) {
            queryBuilder.orderBy(`restaurant.${sortBy}`, sortOrder);
        } else {
            queryBuilder.orderBy('restaurant.created_at', 'DESC');
        }

        const paginationOption: IPaginationOptions = {
            page,
            limit
        };

        const result = await paginate<Restaurant>(queryBuilder, paginationOption);

        return {
            items: plainToInstance(RestaurantResponseDTO, result.items),
            meta: result.meta,
            links: result.links
        };
    }

    async findRestaurantById(id: string): Promise<RestaurantResponseDTO> {

        const restaurant = await this.restaurantRepository.findOne({
            where: { id: id }
        });

        if (!restaurant) {
            throw new RestaurantNotFoundException(id);
        }

        return new RestaurantResponseDTO(restaurant);
    }

    async createRestaurant(createDto: CreateRestaurantDTO): Promise<RestaurantResponseDTO> {

        // Check if restaurant with same name already exists
        const existingByName = await this.restaurantRepository.findOne({
            where: { name: createDto.name }
        });

        if (existingByName) {
            throw new RestaurantAlreadyExistsException(createDto.name);
        }

        // Check if restaurant with same email already exists
        const existingByEmail = await this.restaurantRepository.findOne({
            where: { email: createDto.email }
        });

        if (existingByEmail) {
            throw new RestaurantEmailAlreadyExistsException(createDto.email);
        }

        const restaurant = this.restaurantRepository.create({
            ...createDto,
            rating: 0.0,
            is_active: true,
            created_at: new Date()
        });

        const savedRestaurant = await this.restaurantRepository.save(restaurant);
        return new RestaurantResponseDTO(savedRestaurant);
    }

    async updateRestaurant(id: string, updateDto: UpdateRestaurantDTO): Promise<RestaurantResponseDTO> {

        const restaurant = await this.restaurantRepository.findOne({
            where: { id: id }
        });

        if (!restaurant) {
            throw new RestaurantNotFoundException(id);
        }

        // Check for duplicate name if name is being updated
        if (updateDto.name && updateDto.name !== restaurant.name) {
            const existingByName = await this.restaurantRepository.findOne({
                where: { name: updateDto.name }
            });

            if (existingByName) {
                throw new RestaurantAlreadyExistsException(updateDto.name);
            }
        }

        // Check for duplicate email if email is being updated
        if (updateDto.email && updateDto.email !== restaurant.email) {
            const existingByEmail = await this.restaurantRepository.findOne({
                where: { email: updateDto.email }
            });

            if (existingByEmail) {
                throw new RestaurantEmailAlreadyExistsException(updateDto.email);
            }
        }

        // Update with new data
        Object.assign(restaurant, updateDto);
        restaurant.updated_at = new Date();

        const savedRestaurant = await this.restaurantRepository.save(restaurant);
        return new RestaurantResponseDTO(savedRestaurant);
    }

    async removeRestaurant(id: string): Promise<string> {

        const restaurant = await this.restaurantRepository.findOne({
            where: { id: id }
        });

        if (!restaurant) {
            throw new RestaurantNotFoundException(id);
        }

        await this.restaurantRepository.remove(restaurant);
        return `Restaurant: ${restaurant.name} removed successfully`;
    }

    async toggleRestaurantActive(id: string): Promise<RestaurantResponseDTO> {

        const restaurant = await this.restaurantRepository.findOne({
            where: { id: id }
        });

        if (!restaurant) {
            throw new RestaurantNotFoundException(id);
        }

        restaurant.is_active = !restaurant.is_active;
        restaurant.updated_at = new Date();

        const savedRestaurant = await this.restaurantRepository.save(restaurant);
        return new RestaurantResponseDTO(savedRestaurant);
    }


}