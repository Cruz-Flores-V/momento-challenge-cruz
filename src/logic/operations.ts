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
  return agent.issuance > 0
    ? Number((agent.issuance / agent.claims).toFixed(2))
    : 0;
  // calcular la siniestralidad
  // detectar donde el intervalo donde cae, lo haria con un switch
  // dependiendo del porcentaje obtenido obtenemos la cantidad del bono aplicando
  // la formula Bono = (ME * PB) / 100 sobre el porcentaje obtenido
}
