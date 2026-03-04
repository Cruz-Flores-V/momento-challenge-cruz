export type Agent = {
  id: number;
  name: string;
  lastName: string;
  issuance: number;
  claims: number;
  bonus: number;
};

export type Operation = {
  agent: number;
  operation: string;
  date: string;
  amount: number;
};
