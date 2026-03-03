import { getAgents, showList } from './logic/agents'
import { getIssuance, getClaims, calculateIssuance, calculateClaims, calculateBonus } from './logic/operations'

async function main () {
  const agents = await getAgents()
  const issuance = await getIssuance()
  const claims = await getClaims()

  for (const agent of agents) {
    agent.issuance = calculateIssuance(agent, issuance)
    agent.claims = calculateClaims(agent, claims)
    agent.bonus = calculateBonus(agent)
  }

  showList(agents)
}

main()
