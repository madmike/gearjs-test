import { Controller, Get, Body } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

import { SendService } from '../services/send.service';
import { Stat } from '../models/stat.model';

@Controller('/stats')
export class StatsController {
    constructor(
        private readonly sender: SendService
    ) { }

    @Get()
    getStat() {
        return Stat.findAll({
            attributes: [
                [Sequelize.literal('COUNT(*) FILTER(WHERE "type" = 0)'), 'sent'],
                [Sequelize.literal('COUNT(*) FILTER(WHERE "success" = TRUE AND "type" = 1)'), 'success'],
                [Sequelize.literal('COUNT(*) FILTER(WHERE "success" = FALSE AND "type" = 1)'), 'error'],
            ],
        });
    }
}
