import { Dialect } from 'sequelize';
import { ModelCtor, Sequelize } from 'sequelize-typescript';

import { Logger } from '@nestjs/common';

const logger = new Logger('DB');
export const databaseProvider = (models: ModelCtor[]) => ({
    provide: 'SEQUELIZE',
    useFactory: async () => {
        const sequelize = new Sequelize({
            dialect: process.env.DB_DIALECT as Dialect,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            logging: msg => logger.verbose(msg)
        });
        sequelize.addModels(models);
        await sequelize.sync();
        return sequelize;
    },
});