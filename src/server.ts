import { getAgents, showList } from './logic/agents';
import {
  getIssuance,
  getClaims,
  calculateIssuance,
  calculateClaims,
  calculateBonus,
} from './logic/operations';

async function main() {
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-06-30');
  const agents = await getAgents();
  const issuance = await getIssuance({ startDate, endDate });
  const claims = await getClaims({ startDate, endDate });

  for (const agent of agents) {
    const agentIssuances = issuance.filter(
      (operation) => operation.agent === agent.id,
    );
    const agentClaims = claims.filter(
      (operation) => operation.agent === agent.id,
    );
    agent.issuance = calculateIssuance(agent, agentIssuances);
    agent.claims = calculateClaims(agent, agentClaims);
    agent.bonus = calculateBonus(agent);
  }

  showList(agents);
}

main();
