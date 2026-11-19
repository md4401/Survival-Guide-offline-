/** Premium license: signed token verified offline with a public key (spec §10-11). NOT implemented in the MVP. */
export interface License { sub: string; plan: 'premium'; issued: number; expires: number; graceDays: number; devices: number; sig: string; active: boolean }
export interface LicenseService {
  current(): Promise<License | null>;
  /** Verify the Ed25519 signature offline against the bundled public key. */
  verify(token: string): Promise<License | null>;
  activate(token: string): Promise<License | null>;
  restorePurchases(): Promise<License | null>;
}
export const licenseService: LicenseService = {
  current: async () => null, verify: async () => null, activate: async () => null, restorePurchases: async () => null,
};
