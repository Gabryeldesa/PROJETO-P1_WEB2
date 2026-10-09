import { ObjectLiteral, Repository, FindOptionsOrder, FindOptionsRelations } from "typeorm";

interface PaginationResult<T> {
    error: boolean;
    data: T[];
    correctedPage: number;
    lastPage: number;
    totalRecords: number;
}

export class PaginationService {

    static async paginate<T extends ObjectLiteral>(
        repository: Repository<T>,
        page: number = 1,
        limit: number = 10,
        order: FindOptionsOrder<T> = {},
        relations: FindOptionsRelations<T> = {}
    ): Promise<PaginationResult<T>> {

        const totalRecords = await repository.count();

        const lastPage = Math.ceil(totalRecords / limit);

        if (page > lastPage && lastPage > 0) {
            throw new Error(`Página inválida. O total de páginas é ${lastPage}`);
        }

        const offset = (page - 1) * limit;

        const data = await repository.find({
            take: limit,
            skip: offset,
            order: order,
            relations: relations
        });

        return {
            error: false,
            data,
            correctedPage: page,
            lastPage,
            totalRecords: totalRecords
        };

    }

}