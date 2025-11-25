import { SubnetRow, CalculationResult } from '../types';

/**
 * Converts an IP string (e.g., "192.168.1.1") to a 32-bit unsigned integer.
 */
export const ipToInt = (ip: string): number => {
  return ip.split('.').reduce((acc, octet) => {
    return (acc << 8) + parseInt(octet, 10);
  }, 0) >>> 0; // >>> 0 ensures unsigned 32-bit integer
};

/**
 * Converts a 32-bit integer to an IP string.
 */
export const intToIp = (int: number): string => {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
};

/**
 * Validates an IPv4 address string.
 */
export const isValidIp = (ip: string): boolean => {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
};

/**
 * Converts a CIDR number (0-32) to a Subnet Mask string (e.g., 255.255.255.0).
 */
export const cidrToMask = (cidr: number): string => {
  if (cidr <= 0) return '0.0.0.0';
  if (cidr >= 32) return '255.255.255.255';
  
  // Create mask by shifting.
  // JS shift operators mask the shift count to 5 bits, so we handle 0/32 explicitly above.
  const shift = 32 - cidr;
  const mask = (-1 << shift) >>> 0;
  return intToIp(mask);
};

/**
 * Calculates subnet partitions based on input.
 */
export const calculateSubnets = (
  baseIp: string,
  baseCidr: number,
  subnetsRequested: number
): CalculationResult => {
  if (!isValidIp(baseIp)) {
    return { rows: [], borrowedBits: 0, newCidr: 0, maxHosts: 0, error: 'Invalid IP Address' };
  }

  if (baseCidr < 0 || baseCidr > 32) {
    return { rows: [], borrowedBits: 0, newCidr: 0, maxHosts: 0, error: 'Invalid CIDR' };
  }

  if (subnetsRequested < 1) {
    return { rows: [], borrowedBits: 0, newCidr: 0, maxHosts: 0, error: 'Must request at least 1 subnet' };
  }

  // Calculate Borrowed Bits (S)
  // Formula: 2^S >= subnetsRequested -> S = ceil(log2(subnetsRequested))
  const borrowedBits = Math.ceil(Math.log2(subnetsRequested));
  const newCidr = baseCidr + borrowedBits;

  if (newCidr > 32) {
    return { 
      rows: [], 
      borrowedBits, 
      newCidr, 
      maxHosts: 0, 
      error: `Not enough bits available. Need /${newCidr} but max is /32.` 
    };
  }

  // Calculate hosts per subnet
  // Formula: 2^(32 - newMask) - 2
  const hostBits = 32 - newCidr;
  const totalAddressesPerSubnet = Math.pow(2, hostBits);
  const maxHosts = hostBits < 2 ? 0 : totalAddressesPerSubnet - 2;

  const rows: SubnetRow[] = [];
  const baseIpInt = ipToInt(baseIp);
  
  // Use the input IP strictly as the starting point, even if not a standard network boundary
  // This satisfies user requirement: "the first one is always the same as the input ip"
  const startNetworkInt = baseIpInt;

  // Limit loop to prevent browser crash if user requests millions
  const limit = Math.min(subnetsRequested, 2048); 

  for (let i = 0; i < limit; i++) {
    // Current Subnet Network Address
    const currentNetworkInt = (startNetworkInt + (i * totalAddressesPerSubnet)) >>> 0;
    
    // Broadcast Address
    const broadcastInt = (currentNetworkInt + totalAddressesPerSubnet - 1) >>> 0;

    // Usable Range
    // +1 to first IP, -1 to broadcast
    const firstUsableInt = (currentNetworkInt + 1) >>> 0;
    const lastUsableInt = (broadcastInt - 1) >>> 0;
    
    const hasHosts = hostBits >= 2;

    // Generate Binary String for the Subnet column (S bits)
    const subnetBitsBinary = borrowedBits > 0 ? i.toString(2).padStart(borrowedBits, '0') : '-';

    rows.push({
      index: i + 1,
      subnetBits: subnetBitsBinary,
      networkIp: intToIp(currentNetworkInt),
      cidr: newCidr,
      broadcastIp: intToIp(broadcastInt),
      firstUsable: hasHosts ? intToIp(firstUsableInt) : 'N/A',
      lastUsable: hasHosts ? intToIp(lastUsableInt) : 'N/A',
      hostCount: maxHosts,
      isValid: true,
    });
  }

  return {
    rows,
    borrowedBits,
    newCidr,
    maxHosts,
    error: subnetsRequested > 2048 ? 'Display limited to first 2048 subnets for performance.' : undefined
  };
};