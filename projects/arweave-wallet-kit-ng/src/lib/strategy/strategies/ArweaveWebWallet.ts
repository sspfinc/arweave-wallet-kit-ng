import type { AppInfo, GatewayConfig, PermissionType } from 'arconnect';
import { ArweaveWebWallet } from 'arweave-wallet-connector';
import BrowserWalletStrategy from './BrowserWallet';
import Strategy from '../Strategy';

export default class ArweaveWebWalletStrategy
  extends BrowserWalletStrategy
  implements Strategy
{
  public override id: string = 'webwallet';
  public override name: string = 'Arweave.app';
  public override description: string = 'Web based wallet software';
  public override theme: string = '24, 24, 24';
  public override logo: string = 'qVms-k8Ox-eKFJN5QFvrPQvT9ryqQXaFcYbr-fJbgLY';
  public url: string = 'https://arweave.app';

  #instance = new ArweaveWebWallet();

  constructor() {
    super();
  }

  public override async isAvailable(): Promise<boolean> {
    return true;
  }

  public async resumeSession(): Promise<void> {
    this.#instance.setUrl('arweave.app');
    await this.#instance.connect();
  }

  public override async disconnect(): Promise<void> {
    this.#instance.setUrl('arweave.app');
    await this.#instance.disconnect();
  }

  public override async connect(
    permissions: PermissionType[],
    appInfo?: AppInfo,
    gateway?: GatewayConfig
  ): Promise<void> {
    if (gateway) {
      console.warn(
        '[Arweave Wallet Kit] Arweave.app does not support custom gateway connection yet.'
      );
    }

    // try connecting
    this.#instance = new ArweaveWebWallet(appInfo);
    await this.resumeSession();
  }

  public override addAddressEvent(listener: (address: string) => void) {
    this.#instance.on('connect', listener);

    return listener as any;
  }

  public override removeAddressEvent(listener: any) {
    this.#instance.off('connect', listener);
  }
}
