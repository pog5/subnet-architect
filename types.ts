export interface SubnetRow {
  index: number;
  subnetBits: string;
  networkIp: string;
  cidr: number;
  broadcastIp: string;
  firstUsable: string;
  lastUsable: string;
  hostCount: number;
  isValid: boolean;
}

export interface CalculationResult {
  rows: SubnetRow[];
  borrowedBits: number;
  newCidr: number;
  maxHosts: number;
  error?: string;
}

export enum BitType {
  NETWORK = 'NETWORK',
  SUBNET = 'SUBNET',
  HOST = 'HOST'
}