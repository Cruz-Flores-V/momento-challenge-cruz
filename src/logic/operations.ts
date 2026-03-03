import { Agent, Operation } from './types'
import { readFromCSV } from './utils'

export async function getIssuance () {
  const operations = await readFromCSV('../resources/issuance.csv')
  return operations
}

export async function getClaims () {
  const operations = await readFromCSV('../resources/claims.csv')
  return operations
}

export function calculateIssuance (agent: Agent, operations: Operation[]) {
  let issuance = 0
  for (const op of operations) {
    if (op.agent === agent.id) issuance += Number(op.amount)
  }
  return issuance
}

export function calculateClaims (agent: Agent, operations: Operation[]) {
  let claims = 0
  for (const op of operations) {
    if (op.agent === agent.id) claims += Number(op.amount)
  }
  return claims
}

export function calculateBonus (agent: Agent) {
  return agent.issuance / agent.claims
}
