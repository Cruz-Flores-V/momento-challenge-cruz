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

  return operations.filter((operation) => {
    const operationTimestamp = new Date(operation.date).getTime();
    return (
      operationTimestamp >= startDate.getTime() &&
      operationTimestamp <= endDate.getTime()
    );
  });
}

enum OperationEnum {
  Recovery = 'recovery',
  Reserve = 'reserve',
  Adjust = 'adjust',
  Deductible = 'deductible',
}

function filterByOperation(
  operations: Operation[],
  operationType: OperationEnum,
): Operation[] {
  return operations.filter(({ operation }) => operation === operationType);
}

function sumOperationsAmount(operations: Operation[]) {
  return operations.reduce((acc, curr) => acc + Number(curr.amount), 0);
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
  const reserveOperations = filterByOperation(
    operations,
    OperationEnum.Reserve,
  );
  const adjustOperations = filterByOperation(operations, OperationEnum.Adjust);
  const deductibleOperations = filterByOperation(
    operations,
    OperationEnum.Deductible,
  );
  const recoveryOperations = filterByOperation(
    operations,
    OperationEnum.Recovery,
  );
  const reserveSum = sumOperationsAmount(reserveOperations);
  const adjustSum = sumOperationsAmount(adjustOperations);
  const deductibleSum = sumOperationsAmount(deductibleOperations);
  const recoverySum = sumOperationsAmount(recoveryOperations);

  return Number(
    (reserveSum + adjustSum - deductibleSum - recoverySum).toFixed(2),
  );
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
