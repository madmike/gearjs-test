import { Table, Column, Model, PrimaryKey, Index } from 'sequelize-typescript';
import { MessageType } from 'src/enums/message.enum';

@Table({
    underscored: true
})
export class Stat extends Model {
    @PrimaryKey
    @Column
    id: string;

    @Index
    @Column
    type: MessageType;

    @Column
    success: boolean;

    @Column
    text: string;
}