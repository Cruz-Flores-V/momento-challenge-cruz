import { Agent, Operation } from './types';
import { readFromCSV } from './utils';

export type DateFilter = {
  startDate: Date;
  endDate: Date;
};

function filterByDate(
  operations: Operation[],
  dateFilter?: DateFilter,
): Operation[] {
  const { endDate, startDate } = dateFilter ?? {};
  const mustFilter = startDate && endDate;
  if (!mustFilter) {
    return operations;
  }

  return operations.filter(({ date }) => {
    const operationDate = new Date(date);
    return operationDate >= startDate && operationDate <= endDate;
  });
}

enum OperationEnum {
  Recovery = 'recovery',
  Reserve = 'reserve',
  Adjust = 'adjust',
  Deductible = 'deductible',
}

export async function getIssuance(
  dateFilter?: DateFilter,
): Promise<Operation[]> {
  const operations: Operation[] = await readFromCSV(
    '../resources/issuance.csv',
  );

  return filterByDate(operations, dateFilter);
}

export async function getClaims(dateFilter?: DateFilter): Promise<Operation[]> {
  const operations: Operation[] = await readFromCSV('../resources/claims.csv');

  return filterByDate(operations, dateFilter);
}

export function calculateIssuance(agent: Agent, operations: Operation[]) {
  let issuance = 0;
  for (const op of operations) {
    if (op.agent === agent.id) {
      issuance += Number(op.amount);
    }
  }

  return Number(issuance.toFixed(2));
}

export function calculateClaims(agent: Agent, operations: Operation[]) {
  let reserve = 0;
  let adjust = 0;
  let deductible = 0;
  let recovery = 0;

  for (const op of operations) {
    switch (op.operation) {
      case OperationEnum.Reserve:
        reserve += Number(op.amount);
        break;
      case OperationEnum.Adjust:
        adjust += Number(op.amount);
        break;
      case OperationEnum.Deductible:
        deductible += Number(op.amount);
        break;
      case OperationEnum.Recovery:
        recovery += Number(op.amount);
        break;
    }
  }

  return Number((reserve + adjust - deductible - recovery).toFixed(2));
}

export function calculateBonus(agent: Agent) {
  if (agent.issuance === 0) {
    return 0;
  }
  const siniestralidad = (agent.claims / agent.issuance) * 100;
  const bajaSiniestralidad = siniestralidad <= 65;
  let porcentajeBono = 0;
  // Nota: el requerimiento define los rangos como "X a Y" sin especificar si el límite
  // superior es inclusivo o exclusivo. Aquí se tratan como inclusivos en el rango inferior
  // (ej: issuance === 3500 → 4%, no 5%). Con los datos actuales ningún agente cae
  // exactamente en los valores límite (3500, 5000, 5500, 6000), por lo que no afecta el resultado.
  switch (true) {
    case agent.issuance <= 3500:
      porcentajeBono = bajaSiniestralidad ? 4 : 0;
      break;
    case agent.issuance <= 5000:
      porcentajeBono = bajaSiniestralidad ? 5 : 0;
      break;
    case agent.issuance <= 5500:
      porcentajeBono = bajaSiniestralidad ? 6 : 1;
      break;
    case agent.issuance <= 6000:
      porcentajeBono = bajaSiniestralidad ? 8 : 2;
      break;
    default:
      porcentajeBono = bajaSiniestralidad ? 10 : 3;
  }
  const bono = (agent.issuance * porcentajeBono) / 100;

  return Number(bono.toFixed(2));
}
