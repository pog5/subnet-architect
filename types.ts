export interface SubnetRow {
  index: number;
  subnetBits: string;
  networkIp: string;
  cidr: number;
  broadcastIp: string;
  firstUsable: string;
  lastUsable: string;
  hostCount: string | number; // String for BigInt/Large numbers
  isValid: boolean;
}

export interface CalculationResult {
  rows: SubnetRow[];
  borrowedBits: number;
  newCidr: number;
  maxHosts: string | number;
  error?: string;
}

export enum BitType {
  NETWORK = 'NETWORK',
  SUBNET = 'SUBNET',
  HOST = 'HOST'
}

export type IpVersion = 'v4' | 'v6';