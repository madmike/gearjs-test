import { Controller, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { Stat } from "../models/stat.model";

@Controller('events')
export class EventsController {
    private readonly logger = new Logger(EventsController.name);
    constructor() {}

    @OnEvent('message')
    async handleRequest(payload: any) {
        this.logger.log(payload);
        Stat.create({
            id: payload.id,
            type: payload.type,
            success: payload.success,
            text: (typeof payload.success === 'string' ? payload.success : JSON.stringify(payload.success))
        });
    }
}