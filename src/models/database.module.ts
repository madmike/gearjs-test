import { Module } from '@nestjs/common';

import { databaseProvider } from './database.provider';
import { Stat } from './stat.model';

const provider = databaseProvider([Stat]);

@Module({
    providers: [provider],
    exports: [provider],
})
export class DatabaseModule {}