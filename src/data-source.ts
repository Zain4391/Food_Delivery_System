import { DataSource } from "typeorm";
import { config } from "dotenv";

config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.MIGRATION_URL,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },

    entities: ['src/**/*.entity{.ts,.js}'],
    
    migrations: ['src/migrations/*{.ts,.js}'],
    
    synchronize: false,
    
    logging: true,
});