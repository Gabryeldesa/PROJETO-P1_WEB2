import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSlugToProducts1747715079861 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('products', new TableColumn({
            name: "slug",
            type: "varchar",
            isUnique: true,
            isNullable: false,
        }));

        await queryRunner.query(`ALTER TABLE products MODIFY COLUMN slug varchar(255) AFTER name`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("products", "slug");
    }

}