import { Controller, Body, Post } from '@nestjs/common';

import { SendService } from '../services/send.service';

@Controller()
export class SendController {
    constructor(
        private readonly sender: SendService
    ) { }

    @Post('/send')
    sendMessage(@Body() body) {
        if (body === null || typeof body === 'object' && !Object.keys(body).length) {
            body = 'Ping';
        }

        return this.sender.sendMessage(body);
    }
}
