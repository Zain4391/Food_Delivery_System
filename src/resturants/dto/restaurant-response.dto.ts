import { Restaurant } from "../entities/restaurant.entity";

export class RestaurantResponseDTO {
    id: string;
    name: string;
    description: string;
    cusine_type: string;
    address: string;
    phone: string;
    email: string;
    logo_url: string;
    banner_url: string;
    rating: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;

    constructor(partial: Partial<Restaurant>) {
        Object.assign(this, partial);
    }
}
