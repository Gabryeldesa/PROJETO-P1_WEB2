import { DataSource } from "typeorm";
import { Situations } from "../entity/Situations";

export default class CreateSituationsSeeds {

  public async run(dataSource: DataSource): Promise<void> {
    console.log("Iniciando a criação das seeds de situações...");

    const situationRepository = dataSource.getRepository(Situations);

    const existingCount = await situationRepository.find();

    if (existingCount.length > 0) {
      console.log("As seeds de situações já foram criadas anteriormente. Nenhuma ação será realizada.");
      return;
    }
    
    const situations = [
      { nameSituation: "Ativo" },
      { nameSituation: "Inativo" },
      { nameSituation: "Pendente" },
    ];

    await situationRepository.save(situations);
    console.log("Seeds de situações criadas com sucesso!");
  }
}