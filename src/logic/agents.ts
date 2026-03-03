import { Agent } from './types'
import { readFromCSV } from './utils'

export async function getAgents () {
  const agents = await readFromCSV('../resources/agents.csv')
  return agents
}

export function showList (agents: Agent[]) {
  const tab = '\t'
  console.log(`AGENTE${tab}NOMBRE${tab}APELLIDO${tab}EMISIÓN${tab}SINIESTROS${tab}BONO`)
  for (const agent of agents) {
    console.log(`${agent.id}${tab}${agent.name}${tab}${agent.lastName}${tab}${agent.issuance}${tab}${agent.claims}${tab}${agent.bonus}`)
  }
}
