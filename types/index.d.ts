declare module "nfdjs" {
  export function getNFDByName(name: string): Promise<any>;
  export function getNFDByAddress(address: string): Promise<any>;
  export function getNFDByAddressBatch(data: string[]): Promise<any>; 
}
