import { SubnetRow, CalculationResult, IpVersion } from '../types';

// --- IPv4 Helpers ---

export const ipToInt = (ip: string): number => {
  return ip.split('.').reduce((acc, octet) => {
    return (acc << 8) + parseInt(octet, 10);
  }, 0) >>> 0;
};

export const intToIp = (int: number): string => {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join('.');
};

export const isValidIpV4 = (ip: string): boolean => {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
  });
};

export const cidrToMaskV4 = (cidr: number): string => {
  if (cidr <= 0) return '0.0.0.0';
  if (cidr >= 32) return '255.255.255.255';
  const shift = 32 - cidr;
  const mask = (-1 << shift) >>> 0;
  return intToIp(mask);
};

// --- IPv6 Helpers ---

// Helper to expand :: to full zeros
const expandIPv6 = (ip: string): string => {
    // Handle standard IPv6
    const parts = ip.split('::');
    if (parts.length > 2) return ''; // Invalid multiple ::
    
    let head = parts[0] ? parts[0].split(':') : [];
    let tail = parts.length > 1 && parts[1] ? parts[1].split(':') : [];
    
    // If :: is at start/end
    if (parts.length > 1 && parts[0] === '') head = [];
    if (parts.length > 1 && parts[1] === '') tail = [];

    const missing = 8 - (head.length + tail.length);
    if (missing < 0) return ''; // Too many parts

    const middle = Array(missing).fill('0');
    return [...head, ...middle, ...tail].map(p => p.padStart(4, '0')).join(':');
};

export const ipv6ToBigInt = (ip: string): bigint | null => {
    if (!ip) return null;
    const expanded = expandIPv6(ip);
    if (!expanded) return null;
    
    const parts = expanded.split(':');
    if (parts.length !== 8) return null;

    try {
        let big = 0n;
        for (const part of parts) {
            if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
            big = (big << 16n) + BigInt(parseInt(part, 16));
        }
        return big;
    } catch {
        return null;
    }
};

export const bigIntToIPv6 = (big: bigint): string => {
    let parts: string[] = [];
    for (let i = 0; i < 8; i++) {
        const segment = (big >> BigInt((7 - i) * 16)) & 0xFFFFn;
        parts.push(segment.toString(16));
    }
    // Simple compression could be added here, but standard full output is fine for calc details
    // Let's implement basic compression for display niceness
    const full = parts.join(':');
    // Find longest run of 0s for :: replacement (simplified)
    return full.replace(/(^|:)0(:0)+(:|$)/, '::').replace(/^0::/, '::').replace(/::0$/, '::');
};

export const isValidIpV6 = (ip: string): boolean => {
    return ipv6ToBigInt(ip) !== null;
};

// --- Generic Calculators ---

export const calculateSubnets = (
  baseIp: string,
  baseCidr: number,
  subnetsRequested: number,
  version: IpVersion = 'v4'
): CalculationResult => {
  
  if (version === 'v4') {
      return calculateSubnetsV4(baseIp, baseCidr, subnetsRequested);
  } else {
      return calculateSubnetsV6(baseIp, baseCidr, subnetsRequested);
  }
};

const calculateSubnetsV4 = (
    baseIp: string,
    baseCidr: number,
    subnetsRequested: number
): CalculationResult => {
    if (!isValidIpV4(baseIp)) return { rows: [], borrowedBits: 0, newCidr: 0, maxHosts: 0, error: 'Invalid IP Address' };
    if (baseCidr < 0 || baseCidr > 32) return { rows: [], borrowedBits: 0, newCidr: 0, maxHosts: 0, error: 'Invalid CIDR' };
    if (subnetsRequested < 1) return { rows: [], borrowedBits: 0, newCidr: 0, maxHosts: 0, error: 'Must request at least 1 subnet' };

    const borrowedBits = Math.ceil(Math.log2(subnetsRequested));
    const newCidr = baseCidr + borrowedBits;

    if (newCidr > 32) return { rows: [], borrowedBits, newCidr, maxHosts: 0, error: `Not enough bits. Need /${newCidr}.` };

    const hostBits = 32 - newCidr;
    const totalAddresses = Math.pow(2, hostBits);
    const maxHosts = hostBits < 2 ? 0 : totalAddresses - 2;
    const baseIpInt = ipToInt(baseIp);
    const startNetworkInt = baseIpInt;

    const rows: SubnetRow[] = [];
    const limit = Math.min(subnetsRequested, 2048);

    for (let i = 0; i < limit; i++) {
        const currentNetworkInt = (startNetworkInt + (i * totalAddresses)) >>> 0;
        const broadcastInt = (currentNetworkInt + totalAddresses - 1) >>> 0;
        const firstUsableInt = (currentNetworkInt + 1) >>> 0;
        const lastUsableInt = (broadcastInt - 1) >>> 0;
        const hasHosts = hostBits >= 2;
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
        error: subnetsRequested > 2048 ? 'Display limited to first 2048 subnets.' : undefined
    };
};

const calculateSubnetsV6 = (
    baseIp: string,
    baseCidr: number,
    subnetsRequested: number
): CalculationResult => {
    const baseIpBig = ipv6ToBigInt(baseIp);
    if (baseIpBig === null) return { rows: [], borrowedBits: 0, newCidr: 0, maxHosts: 0, error: 'Invalid IPv6 Address' };
    if (baseCidr < 0 || baseCidr > 128) return { rows: [], borrowedBits: 0, newCidr: 0, maxHosts: 0, error: 'Invalid CIDR' };
    if (subnetsRequested < 1) return { rows: [], borrowedBits: 0, newCidr: 0, maxHosts: 0, error: 'Must request at least 1 subnet' };

    const borrowedBits = Math.ceil(Math.log2(subnetsRequested));
    const newCidr = baseCidr + borrowedBits;

    if (newCidr > 128) return { rows: [], borrowedBits, newCidr, maxHosts: 0, error: `Not enough bits. Need /${newCidr}.` };

    // Calculate host count (approximate for display)
    const hostBits = BigInt(128 - newCidr);
    // 2^hostBits. IPv6 doesn't strictly reserve 2 addresses in the same way, but for general math:
    // We will just show total addresses as "hosts" usually for IPv6 unless /127 or /128
    const totalAddresses = 1n << hostBits; 
    // Format large numbers nicely
    let maxHostsStr = totalAddresses.toString();
    if (totalAddresses > 1000000000n) {
        maxHostsStr = `~2^${hostBits}`;
    }

    const rows: SubnetRow[] = [];
    const limit = Math.min(subnetsRequested, 512); // Lower limit for V6 string gen performance?
    
    // Increment amount: 2^(128 - newCidr)
    const increment = 1n << BigInt(128 - newCidr);
    const startNetworkBig = baseIpBig; // User wants to start exactly at input

    for (let i = 0; i < limit; i++) {
        const offset = BigInt(i) * increment;
        const currentNetworkBig = startNetworkBig + offset;
        const endBig = currentNetworkBig + increment - 1n; // Last IP
        
        // V6 usability ranges:
        // Usually Network is Anycast, Last is potential Anycast. 
        // We'll just list Start and End for clarity in V6 mode.
        // Or Start+1 to End. Let's do Start to End for "Network/Broadcast" columns
        // And Start+1 to End for "Range".
        
        const firstUsableBig = currentNetworkBig + 1n;
        const lastUsableBig = endBig; // Often usable, but let's stick to simple logic

        const subnetBitsBinary = borrowedBits > 0 ? i.toString(2).padStart(borrowedBits, '0') : '-';

        rows.push({
            index: i + 1,
            subnetBits: subnetBitsBinary,
            networkIp: bigIntToIPv6(currentNetworkBig),
            cidr: newCidr,
            broadcastIp: bigIntToIPv6(endBig),
            firstUsable: bigIntToIPv6(firstUsableBig),
            lastUsable: bigIntToIPv6(lastUsableBig),
            hostCount: maxHostsStr,
            isValid: true,
        });
    }

    return {
        rows,
        borrowedBits,
        newCidr,
        maxHosts: maxHostsStr,
        error: subnetsRequested > 512 ? 'Display limited to first 512 subnets.' : undefined
    };
};