import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateProductsTable1791500720000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "products",
            columns: [
                { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "name", type: "varchar", length: "255" },
                { name: "productSituationId", type: "int" },
                { name: "productCategoryId", type: "int" },
                { name: "createdAt", type: "timestamp", default: "CURRENT_TIMESTAMP" },
                { name: "updatedAt", type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" },
            ],
            foreignKeys: [
                {
                    columnNames: ["productSituationId"],
                    referencedTableName: "product_situations",
                    referencedColumnNames: ["id"],
                },
                {
                    columnNames: ["productCategoryId"],
                    referencedTableName: "product_categories",
                    referencedColumnNames: ["id"],
                },
            ],
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("products")
    }
}