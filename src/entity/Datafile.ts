import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity } from 'typeorm';

@Entity({ name: 'datafiles' })
export class Datafile extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    description: string;

    @CreateDateColumn()
    creationDate: Date;
}
