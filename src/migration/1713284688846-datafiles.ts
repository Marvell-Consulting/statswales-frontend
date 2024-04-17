import { MigrationInterface, QueryRunner } from 'typeorm';

export class Datafiles1713284688846 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
          --Table Definition
          CREATE TABLE "datafiles"  (
            "id" uuid NOT NULL DEFAULT gen_random_uuid(),
            "name" character varying NOT NULL,
            "description" character varying NOT NULL,
            "creationDate" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
          );`,
            undefined
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "datafiles"`, undefined);
    }
}
