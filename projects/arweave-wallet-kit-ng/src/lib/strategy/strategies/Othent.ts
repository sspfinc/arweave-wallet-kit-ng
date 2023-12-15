import type { SignatureOptions } from 'arweave/web/lib/crypto/crypto-interface';
import type { DispatchResult, GatewayConfig, PermissionType } from 'arconnect';
import type Transaction from 'arweave/web/lib/transaction';
import type { AppInfo } from 'arweave-wallet-connector';
import {
  Othent,
  PingReturnProps,
  queryWalletAddressTxnsProps,
  queryWalletAddressTxnsReturnProps,
  ReadContractReturnProps,
  readCustomContractProps,
  readCustomContractReturnProps,
  SendTransactionArweaveProps,
  SendTransactionArweaveReturnProps,
  SendTransactionBundlrProps,
  SendTransactionBundlrReturnProps,
  SendTransactionWarpProps,
  SendTransactionWarpReturnProps,
  SignTransactionArweaveReturnProps,
  SignTransactionBundlrProps,
  SignTransactionWarpProps,
  SignTransactionWarpReturnProps,
  useOthentReturnProps,
  UserDetailsReturnProps,
  verifyArweaveDataProps,
  verifyArweaveDataReturnProps,
  verifyBundlrDataProps,
  verifyBundlrDataReturnProps,
} from 'othent';
import Strategy from '../Strategy';

export default class OthentStrategy implements Strategy {
  public id = 'othent';
  public name = 'Google';
  public description =
    'Sign in with Google through Othent Smart Contract Wallets';
  public theme = '35, 117, 239';
  public logo = '33nBIUNlGK4MnWtJZQy9EzkVJaAd7WoydIKfkJoMvDs';
  public url = 'https://othent.io';

  #apiID = 'e27671e337ce37c7bbaf7459e0df65a0';
  #addressListeners: ListenerFunction[] = [];

  /**
   * Advanced function to override the default API ID
   * Othent uses.
   */
  public __overrideApiID(othentApiID: string): void {
    this.#apiID = othentApiID;
  }

  async #othentInstance(
    ensureConnection = true
  ): Promise<useOthentReturnProps> {
    // init othent
    const othent = await Othent({
      API_ID: this.#apiID,
    });

    if (!othent) {
      throw new Error('[Arweave Wallet Kit] Invalid Othent API ID');
    }

    if (ensureConnection) {
      const permissions = await this.getPermissions();

      if (permissions.length === 0) {
        throw new Error('[Arweave Wallet Kit] You are not connected to Othent');
      }
    }

    return othent;
  }

  public async isAvailable(): Promise<boolean> {
    try {
      // ensure instance
      await this.#othentInstance(false);

      return true;
    } catch {
      return false;
    }
  }

  public async ping(): Promise<PingReturnProps> {
    const othent = await this.#othentInstance(false);

    return await othent.ping();
  }

  public async connect(
    permissions: PermissionType[],
    appInfo?: AppInfo,
    gateway?: GatewayConfig
  ): Promise<void> {
    const othent = await this.#othentInstance(false);
    const res = await othent.logIn({});

    for (const listener of this.#addressListeners) {
      listener(res.contract_id);
    }
  }

  public async disconnect(): Promise<void> {
    const othent = await this.#othentInstance();

    await othent.logOut();

    for (const listener of this.#addressListeners) {
      listener(undefined as any);
    }
  }

  public async getPermissions(): Promise<PermissionType[]> {
    const othent = await this.#othentInstance(false);

    try {
      const res = await othent.userDetails();

      for (const listener of this.#addressListeners) {
        listener(res.contract_id);
      }

      return [
        'ACCESS_ADDRESS',
        'ACCESS_PUBLIC_KEY',
        'ACCESS_ALL_ADDRESSES',
        'SIGN_TRANSACTION',
        'ENCRYPT',
        'DECRYPT',
        'SIGNATURE',
        'ACCESS_ARWEAVE_CONFIG',
        'DISPATCH',
      ] as PermissionType[];
    } catch {
      return [];
    }
  }

  public async getActiveAddress(): Promise<string> {
    const othent = await this.#othentInstance(false);
    const res = await othent.userDetails();

    return res.contract_id;
  }

  public async getAllAddresses(): Promise<string[]> {
    const addr = await this.getActiveAddress();

    return [addr];
  }

  /**
   * Same as "sendTransactionArweave()" of the Othent SDK
   */
  public async sign(
    transaction: Transaction,
    options?: SignatureOptions
  ): Promise<SignTransactionArweaveReturnProps> {
    if (options) {
      console.warn(
        '[Arweave Wallet Kit] Othent does not support transaction signature options'
      );
    }

    if (transaction.quantity !== '0' && transaction.target !== '') {
      throw new Error(
        '[Arweave Wallet Kit] Signing with Othent only supports data type transactions'
      );
    }
    const othent = await this.#othentInstance(false);

    const signedTransaction = await othent.signTransactionArweave({
      othentFunction: 'uploadData',
      data: transaction.data,
      tags: transaction.tags ? transaction.tags : [],
    });

    return signedTransaction;
  }

  public async signTransactionBundlr(
    params: SignTransactionBundlrProps
  ): Promise<SignTransactionArweaveReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.signTransactionBundlr(params);
  }

  public async signTransactionWarp(
    params: SignTransactionWarpProps
  ): Promise<SignTransactionWarpReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.signTransactionWarp(params);
  }

  public async sendTransactionArweave(
    params: SendTransactionArweaveProps
  ): Promise<SendTransactionArweaveReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.sendTransactionArweave(params);
  }

  public async sendTransactionBundlr(
    params: SendTransactionBundlrProps
  ): Promise<SendTransactionBundlrReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.sendTransactionBundlr(params);
  }

  public async sendTransactionWarp(
    params: SendTransactionWarpProps
  ): Promise<SendTransactionWarpReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.sendTransactionWarp(params);
  }

  public async verifyArweaveData(
    params: verifyArweaveDataProps
  ): Promise<verifyArweaveDataReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.verifyArweaveData(params);
  }

  public async verifyBundlrData(
    params: verifyBundlrDataProps
  ): Promise<verifyBundlrDataReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.verifyBundlrData(params);
  }

  public async dispatch(transaction: Transaction): Promise<DispatchResult> {
    try {
      const othent = await this.#othentInstance(false);

      const signedTransaction = await othent.signTransactionBundlr({
        othentFunction: 'uploadData',
        data: transaction.data,
        tags: transaction.tags ? transaction.tags : [],
      });

      const res = await othent.sendTransactionBundlr(signedTransaction);

      if (res.success === true) {
        return { id: res.transactionId, type: 'BUNDLED' };
      } else {
        try {
          const othent = await this.#othentInstance(false);

          const signedTransaction = await othent.signTransactionArweave({
            othentFunction: 'uploadData',
            data: transaction.data,
            tags: transaction.tags ? transaction.tags : [],
          });

          const res = await othent.sendTransactionArweave(signedTransaction);

          if (res.success === true) {
            return { id: res.transactionId, type: 'BASE' };
          } else {
            throw new Error(
              `Failed to dispatch layer transaction. Please recheck request.`
            );
          }
        } catch (error) {
          throw new Error(
            `Unable to dispatch Base layer transaction: ${error}`
          );
        }
      }
    } catch (error) {
      throw new Error(`Unable to dispatch Bundled transaction: ${error}`);
    }
  }

  public async queryWalletAddressTxns(
    params: queryWalletAddressTxnsProps
  ): Promise<queryWalletAddressTxnsReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.queryWalletAddressTxns(params);
  }

  public async userDetails(): Promise<UserDetailsReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.userDetails();
  }

  public async readContract(): Promise<ReadContractReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.readContract();
  }

  public async readCustomContract(
    params: readCustomContractProps
  ): Promise<readCustomContractReturnProps> {
    const othent = await this.#othentInstance();

    return await othent.readCustomContract(params);
  }

  public addAddressEvent(listener: ListenerFunction): any {
    this.#addressListeners.push(listener);

    // placeholder function
    return listener as any;
  }

  public removeAddressEvent(
    listener: (e: CustomEvent<{ address: string }>) => void
  ): void {
    this.#addressListeners.splice(
      this.#addressListeners.indexOf(listener as any),
      1
    );
  }
}

type ListenerFunction = (address: string) => void;
