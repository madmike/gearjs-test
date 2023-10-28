import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { SendService } from './services/send.service';
import { SendController } from './controllers/send.controller';
import { EventsController } from './controllers/events.controller';
import { DatabaseModule } from './models/database.module';
import { StatsController } from './controllers/stats.controller';

@Module({
  imports: [EventEmitterModule.forRoot(), DatabaseModule],
  controllers: [SendController, EventsController, StatsController],
  providers: [SendService],
})
export class AppModule {}
