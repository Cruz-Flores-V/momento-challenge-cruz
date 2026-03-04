import { Agent } from './types';
import { readFromCSV } from './utils';

export async function getAgents(): Promise<Agent[]> {
  const agents = await readFromCSV('../resources/agents.csv');
  return agents;
}

export function showList(agents: Agent[]) {
  const rows = agents.map(
    ({ id, name, lastName, issuance, claims, bonus }) => ({
      Agente: id,
      Nombre: name,
      Apellido: lastName,
      Emisión: issuance,
      Siniestros: claims,
      Bono: bonus,
    }),
  );
  console.table(rows);
}
