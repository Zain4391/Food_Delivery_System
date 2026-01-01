import { CATEGORY } from "../entities/menu-item.entity";
import { MenuItem } from "../entities/menu-item.entity";

export class MenuItemResponseDTO {
    id: string;
    name: string;
    description: string;
    price: number;
    category: CATEGORY;
    image_url: string;
    is_available: boolean;
    preparation_time: number;
    restaurant_id: string;
    created_at: Date;
    updated_at: Date;

    constructor(partial: Partial<MenuItem>) {
        Object.assign(this, partial);
    }
}
