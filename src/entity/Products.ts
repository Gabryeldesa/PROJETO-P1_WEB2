import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { ProductSituations } from "./ProductSituations"
import { ProductCategories } from "./ProductCategories"

@Entity("products")
export class Products {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: "varchar", length: 255 })
    name!: string

    @Column()
    productSituationId!: number

    @Column()
    productCategoryId!: number

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date

    @ManyToOne(() => ProductSituations, (situation) => situation.products)
    @JoinColumn({ name: "productSituationId" })
    productSituation!: ProductSituations

    @ManyToOne(() => ProductCategories, (category) => category.products)
    @JoinColumn({ name: "productCategoryId" })
    productCategory!: ProductCategories
}