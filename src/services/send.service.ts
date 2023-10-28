import { readFile } from 'fs/promises';

import { GearApi, GearKeyring, decodeAddress, ProgramMetadata } from '@gear-js/api';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { MessageType } from '../enums/message.enum';

@Injectable()
export class SendService implements OnModuleInit, OnModuleDestroy {
    private logger = new Logger(SendService.name);

    private api: GearApi;
    private meta: ProgramMetadata;
    private keyring: any;
    private unsubscribe: VoidFunction;
    private readonly programId = process.env.PROGRAM_ID;
    private readonly accountId = process.env.ACCOUNT_ID;
    private readonly messages: Record<string, { id: string, payload: Buffer }> = {};

    constructor(
        private events: EventEmitter2
    ) {}

    async onModuleInit() {
        this.api = await GearApi.create({ providerAddress: process.env.PROVIDER_ADDRESS });
        this.meta = ProgramMetadata.from(await readFile('data/test_task.meta.txt').then( buf => buf.toString()));
        this.keyring = await GearKeyring.fromMnemonic(process.env.MNEMONIC, 'test');

        this.unsubscribe = await this.subscribeEvents();
    }

    async onModuleDestroy() {
        this.unsubscribe();
    }

    async subscribeEvents() {
        return this.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
            if (message.source.toHex() === this.programId && message?.details?.toJSON) {
                const key = (message.details.toJSON() as any).to;
                this.messages[key] = {
                    id: message.id.toHex(),
                    payload: Buffer.from(message.payload.toHex().substring(2), 'hex')
                }
            }
        });
    }

    async sendMessage(message: any) {
        this.logger.debug('Calculating gas...');
        const gas = await this.calculateGas(message);
        this.logger.log(`Gas ammount is: ${gas.min_limit.toString()}`);

    
        const sending = this.send(message, gas);
        return sending.then((messageId) => {
            if (!(messageId in this.messages)) {
                throw Error('No message');
            }

            this.events.emit('message', {
                id: this.messages[messageId].id,
                type: MessageType.REQUEST,
                success: true,
                text: message
            });

            this.logger.log('Recieved message:', this.messages[messageId]);
            const status = this.messages[messageId].payload.slice(0, 2);
            const response = this.messages[messageId].payload.slice(2).toString();

            const vec = {
                id: messageId,
                type: MessageType.RESPONSE,
                success: status[0] === 0x00 && status[1] === 0x10 ? true : false,
                text: response
            };
            this.events.emit('message', vec);

            delete this.messages[messageId];
            return vec;
        }).catch( error => {
            this.logger.error('Error sending message', error);
            this.events.emit('response', {
                type: MessageType.RESPONSE,
                success: false
            });

            throw(error);
        });
    }

    private send(message: string, gas: any): Promise<string> {
        this.logger.debug('Sending message...');
        const tx = this.api.message.send({
            destination: this.programId as any,
            payload: message,
            gasLimit: gas.min_limit,
            value: 0,
            prepaid: true,
            account: this.accountId as any
        }, this.meta);

        let messageId: string;
        return new Promise((resolve, reject) => {
            tx.signAndSend(this.keyring, ({ events, status }) => {
                this.logger.debug(`STATUS: ${status.toString()}`);

                events.forEach(({ event }) => {
                    if (event.method === 'MessageQueued') {
                        messageId = event.data.id.toHex();
                    } else if (event.method === 'ExtrinsicFailed') {
                        reject(this.api.getExtrinsicFailedError(event).docs.join('/n'));
                    }
                });

                if (status.isFinalized) {
                    resolve(messageId);
                }
            });
        });
    }

    private async calculateGas(message: any) {
        return await this.api.program.calculateGas.handle(
            decodeAddress(this.keyring.address),
            this.programId as any,
            message,
            0,
            false,
            this.meta,
        );
    }
};