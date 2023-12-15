import { Injectable, Optional, SkipSelf } from '@angular/core';

import {
  AppInfo,
  DispatchResult,
  GatewayConfig,
  PermissionType,
} from 'arconnect';
import { SignatureOptions } from 'arweave/web/lib/crypto/crypto-interface';
import Transaction from 'arweave/web/lib/transaction';
import { SignTransactionArweaveReturnProps } from 'othent';
import { BehaviorSubject } from 'rxjs';
import Strategy from './strategy/Strategy';
import { AKN_EVENT, EVENT_CODES } from './types';

import Arweave from 'arweave/node';

// declare const Arweave: any;

@Injectable()
export class ArweaveWalletKitNgService {
  private arweave!: Arweave;
  private isActive = false;

  private strategies!: Strategy[];
  public strategy!: Strategy | undefined;
  private strategyType: string | undefined;

  private permissions!: PermissionType[];
  public gatewayConfig!: GatewayConfig;
  private appInfo!: AppInfo;

  /**
   * Event Emitter For Changes
   */
  private eventEmitter: BehaviorSubject<AKN_EVENT> =
    new BehaviorSubject<AKN_EVENT>({});
  public eventEmitterObservable = this.eventEmitter.asObservable();

  /**
   * ArweaveWalletKitNgService Constructor For Preventing Multiple Imports
   * @param arweaveWalletKitNgService
   */
  constructor(
    @Optional()
    @SkipSelf()
    arweaveWalletKitNgService?: ArweaveWalletKitNgService
  ) {
    if (arweaveWalletKitNgService) {
      throw new Error('arweaveWalletKitNgService is already loaded!');
    }
  }

  /**
   * Init ArweaveWalletKitNgService And Reconnect If Possible
   * @param appInfo
   * @param permissions
   * @param local
   */
  public async init(
    appInfo: AppInfo,
    strategies: Strategy[],
    permissions: PermissionType[],
    local = false
  ) {
    if (!appInfo || !appInfo.name) {
      throw new Error('Init(): AppInfo.name is required');
    }
    if (!strategies) {
      throw new Error('Init(): Strategies is required');
    }
    if (!permissions) {
      throw new Error('Init(): Permissions are required');
    }

    this.appInfo = appInfo;
    this.strategies = strategies;
    this.permissions = permissions;

    if (local) {
      this.gatewayConfig = {
        host: 'localhost',
        port: 1984,
        protocol: 'http',
      };
    } else {
      this.gatewayConfig = {
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
      };
    }

    this.arweave = new Arweave(this.gatewayConfig);

    this.strategyType = localStorage.getItem('strategy') || undefined;

    this.strategy = this.strategies.find(
      strategy => strategy.id === this.strategyType
    );
    if (this.strategy && this.strategy.resumeSession) {
      this.emit('Can Resume', EVENT_CODES.CAN_RESUME);
    } else if (this.strategy) {
      this.emit('READY', EVENT_CODES.READY, this.strategy);
    }
  }

  /**
   * Toggle Is Active For Showing Connection Modal
   */
  public toggleIsActive() {
    this.isActive = !this.isActive;
    this.emit('Modal Toggled', EVENT_CODES.MODAL, this.isActive);
  }

  /**
   * Toggle Is Active For Showing Connection Modal
   * @params isActive - boolean for setting is_active
   */
  public setIsActive(isActive: boolean) {
    this.isActive = isActive;
    this.emit('Modal Set', EVENT_CODES.MODAL, this.isActive);
  }

  /**
   * Connect To A Wallet Based On Type and Emit Change
   * @param type - WalletType
   */
  public async connect(strategy: Strategy) {
    this.emit('Try Connect', EVENT_CODES.TRY_CONNECT);
    this.strategy = strategy;
    try {
      await strategy.connect(
        this.permissions,
        this.appInfo,
        this.gatewayConfig
      );
      localStorage.setItem('strategy', this.strategy.id);

      this.emit('Connected', EVENT_CODES.CONNECT);
    } catch (e) {
      this.strategy = undefined;
      localStorage.removeItem('strategy');

      this.emitError('Could Not Connect', EVENT_CODES.CONNECT_ERROR, e);
    }
  }

  /**
   * Disconnect From Wallet and Emit Change
   */
  public async disconnect() {
    this.emit('Try Disconnect', EVENT_CODES.TRY_DISCONNECT);
    localStorage.removeItem('strategy');
    if (!this.strategy) {
      return;
    }
    console.log(await this.strategy.isAvailable());
    try {
      await this.strategy.disconnect();
      this.emit('Disconnected', EVENT_CODES.DISCONNECT);
    } catch (e) {
      this.emitError('Could Not Disconnect', EVENT_CODES.DISCONNECT, e);
    }
    this.strategy = undefined;
  }

  /**
   * Resume Session From Wallet and Emit Change
   * @returns - returns null if error
   */
  public async resume(): Promise<void | null> {
    this.emit('Try Resume', EVENT_CODES.TRY_RESUME);
    if (!this.strategy || !this.strategy.resumeSession) {
      this.emitError('Cannot Resume', EVENT_CODES.RESUME_ERROR);
      return null;
    }
    try {
      const result = await this.strategy.resumeSession();
      this.emit('Session Resumed', EVENT_CODES.RESUME, result);
      return result;
    } catch (e) {
      this.emitError('Could Not Resume Session', EVENT_CODES.RESUME_ERROR, e);
      return null;
    }
  }

  /**
   * Get Active Address From Wallet and Emit Change
   * @returns address of wallet or null
   */
  public async getActiveAddress(): Promise<string | null> {
    this.emit('Try Active Address', EVENT_CODES.TRY_ACTIVE_ADDRESS);
    if (!this.strategy) {
      return null;
    }
    try {
      const address = await this.strategy.getActiveAddress();
      this.emit('Active Address', EVENT_CODES.ACTIVE_ADDRESS, address);
      return address;
    } catch (e) {
      this.emitError(
        'Could Not Get Active Address',
        EVENT_CODES.ACTIVE_ADDRESS_ERROR,
        e
      );
      return null;
    }
  }

  /**
   * Get All Active Addresses From Connected Wallet and Emit Change
   * @returns - returns the all active addresses of the wallet or null
   */
  public async getAllAddresses(): Promise<string[] | null> {
    this.emit('Try All Active Addresses', EVENT_CODES.TRY_ALL_ACTIVE_ADDRESSES);
    if (!this.strategy || !this.strategy.getAllAddresses) {
      return null;
    }
    try {
      const result = await this.strategy.getAllAddresses();
      this.emit(
        'All Active Addresses',
        EVENT_CODES.ALL_ACTIVE_ADDRESSES,
        result
      );
      return result;
    } catch (e) {
      this.emitError(
        'Could Not Get All Active Addresses',
        EVENT_CODES.ALL_ACTIVE_ADDRESSES_ERROR,
        e
      );
      return null;
    }
  }

  /**
   * Sign Transaction using Wallet and Emit Change
   * @param transaction
   * @param options
   * @returns - returns the signed transaction or null
   */
  public async sign(
    transaction: Transaction,
    options?: SignatureOptions
  ): Promise<Transaction | SignTransactionArweaveReturnProps | null> {
    this.emit('Try Sign', EVENT_CODES.TRY_SIGN);
    if (!this.strategy) {
      return transaction;
    }
    try {
      const result = await this.strategy.sign(transaction, options);
      this.emit('Signed', EVENT_CODES.SIGN, result);
      return result;
    } catch (e) {
      this.emitError('Could Not Sign', EVENT_CODES.SIGN_ERROR, e);
      return null;
    }
  }

  /**
   * Get Permissions From Connected Wallet and Emit Change
   * @returns - returns permissions of the connected wallet or null
   */
  public async getPermissions(): Promise<PermissionType[] | null> {
    this.emit('Try Permissions', EVENT_CODES.TRY_PERMISSIONS);
    if (!this.strategy) {
      return null;
    }
    try {
      const result = await this.strategy.getPermissions();
      this.emit('Permissions', EVENT_CODES.PERMISSIONS, result);
      return result;
    } catch (e) {
      this.emitError(
        'Could Not Get Permissions',
        EVENT_CODES.PERMISSIONS_ERROR,
        e
      );
      return null;
    }
  }

  /**
   * Get Wallet Names From Connected Wallet and Emit Change
   * @returns - returns the wallet names of the connected wallet or null
   */
  public async getWalletNames(): Promise<{ [addr: string]: string } | null> {
    this.emit('Try Wallet Names', EVENT_CODES.TRY_WALLET_NAMES);
    if (!this.strategy || !this.strategy.getWalletNames) {
      return null;
    }
    try {
      const result = await this.strategy.getWalletNames();
      this.emit('Wallet Names', EVENT_CODES.WALLET_NAMES, result);
      return result;
    } catch (e) {
      this.emitError(
        'Could Not Get Wallet Names',
        EVENT_CODES.WALLET_NAMES_ERROR,
        e
      );
      return null;
    }
  }

  /**
   * Encrypt Data using Connected Wallet and Emit Change
   * @param data - data to encrypt
   * @param algorithm - algorithm to use for encryption (RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams)
   * @returns - returns the encrypted data or null
   */
  public async encrypt(
    data: BufferSource,
    algorithm: RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams
  ): Promise<Uint8Array | null> {
    this.emit('Try Encrypt', EVENT_CODES.TRY_ENCRYPT);
    if (!this.strategy || !this.strategy.encrypt) {
      return null;
    }
    try {
      const result = await this.strategy.encrypt(data, algorithm);
      this.emit('Encrypted', EVENT_CODES.ENCRYPT, result);
      return result;
    } catch (e) {
      this.emitError('Could Not Encrypt', EVENT_CODES.ENCRYPT_ERROR, e);
      return null;
    }
  }

  /**
   * Decrypt Data using Connected Wallet and Emit Change
   * @param data - data to decrypt
   * @param algorithm - algorithm to use for decryption (RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams)
   * @returns - returns the decrypted data or null
   */
  public async decrypt(
    data: BufferSource,
    algorithm: RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams
  ): Promise<Uint8Array | null> {
    this.emit('Try Decrypt', EVENT_CODES.TRY_DECRYPT);
    if (!this.strategy || !this.strategy.decrypt) {
      return null;
    }
    try {
      const result = await this.strategy.decrypt(data, algorithm);
      this.emit('Decrypted', EVENT_CODES.DECRYPT, result);
      return result;
    } catch (e) {
      this.emitError('Could Not Decrypt', EVENT_CODES.DECRYPT_ERROR, e);
      return null;
    }
  }

  /**
   * Get Arweave Config using Connected Wallet and Emit Change
   * @returns - returns the arweave config or null
   */
  public async getArweaveConfig(): Promise<GatewayConfig | null> {
    this.emit('Try Arweave Config', EVENT_CODES.TRY_ARWEAVE_CONFIG);
    if (!this.strategy || !this.strategy.getArweaveConfig) {
      return null;
    }
    try {
      const result = await this.strategy.getArweaveConfig();
      this.emit('Arweave Config', EVENT_CODES.ARWEAVE_CONFIG, result);
      return result;
    } catch (e) {
      this.emitError(
        'Could Not Get Arweave Config',
        EVENT_CODES.ARWEAVE_CONFIG_ERROR,
        e
      );
      return null;
    }
  }

  /**
   * Get Signature using Connected Wallet and Emit Change
   * @param data - data to sign
   * @param algorithm - algorithm to use for signing (AlgorithmIdentifier | RsaPssParams | EcdsaParams)
   * @returns - returns the signature or null
   */
  public async signature(
    data: Uint8Array,
    algorithm: AlgorithmIdentifier | RsaPssParams | EcdsaParams
  ): Promise<Uint8Array | null> {
    this.emit('Try Signature', EVENT_CODES.TRY_SIGNATURE);
    if (!this.strategy || !this.strategy.signature) {
      return null;
    }
    try {
      const result = await this.strategy.signature(data, algorithm);
      this.emit('Signature', EVENT_CODES.SIGNATURE, result);
      return result;
    } catch (e) {
      this.emitError('Could Not Get Signature', EVENT_CODES.SIGNATURE_ERROR, e);
      return null;
    }
  }

  /**
   * Get Public Key using Connected Wallet and Emit Change
   * @returns - returns the public key or null
   */
  public async getActivePublicKey(): Promise<string | null> {
    this.emit('Try Active Public Key', EVENT_CODES.TRY_ACTIVE_PUBLIC_KEY);
    if (!this.strategy || !this.strategy.getActivePublicKey) {
      return null;
    }

    try {
      const result = await this.strategy.getActivePublicKey();
      this.emit('Active Public Key', EVENT_CODES.ACTIVE_PUBLIC_KEY, result);
      return result;
    } catch (e) {
      this.emitError(
        'Could Not Get Active Public Key',
        EVENT_CODES.ACTIVE_PUBLIC_KEY_ERROR,
        e
      );
      return null;
    }
  }

  /**
   * Add Token using Connected Wallet and Emit Change
   * @param id - id of token
   * @returns - returns the token or null
   */
  public async addToken(id: string): Promise<void | null> {
    this.emit('Try Add Token', EVENT_CODES.TRY_ADD_TOKEN);
    if (!this.strategy || !this.strategy.addToken) {
      return null;
    }
    try {
      const result = await this.strategy.addToken(id);
      this.emit('Added Token', EVENT_CODES.ADD_TOKEN, result);
      return result;
    } catch (e) {
      this.emitError('Could Not Add Token', EVENT_CODES.ADD_TOKEN_ERROR, e);
      return null;
    }
  }

  /**
   * Dispatch Transaction using Connected Wallet and Emit Change
   * @param transaction - transaction to dispatch
   * @returns - returns the dispatch result or null
   */
  public async dispatch(
    transaction: Transaction
  ): Promise<DispatchResult | null> {
    this.emit('Try Dispatch', EVENT_CODES.TRY_DISPATCH);
    if (!this.strategy || !this.strategy.dispatch) {
      return null;
    }
    try {
      const result = await this.strategy.dispatch(transaction);
      this.emit('Transaction Dispatched', EVENT_CODES.DISPATCH, result);
      return result;
    } catch (e) {
      this.emitError(
        'Could Not Dispatch Transaction',
        EVENT_CODES.DISPATCH_ERROR,
        e
      );
      return null;
    }
  }

  /**
   * Emit Events
   * @param message - Message For Event (Optional)
   * @param code - Code For Event (EVENT_CODES)
   * @param data - Data For Event (Optional)
   */
  private emit(message: string, code: EVENT_CODES, data?: any) {
    this.eventEmitter.next({
      code,
      message,
      data,
    });
  }

  /**
   * Emit Error Events
   * @param message - Message For Event (Optional)
   * @param code - Code For Event (EVENT_CODES)
   * @param data - Data For Event (Optional)
   */
  private emitError(message: string, code: EVENT_CODES, data?: any) {
    this.eventEmitter.next({
      code,
      message,
      data,
    });
  }

  public async getBalance(address: string): Promise<number | null> {
    this.emit('Try Balance', EVENT_CODES.TRY_BALANCE);
    if (!this.arweave) {
      return null;
    }
    try {
      const result = this.arweave.ar.winstonToAr(
        await this.arweave.wallets.getBalance(address)
      );
      const balance = Number(result);
      this.emit('Balance', EVENT_CODES.BALANCE, balance);
      return balance;
    } catch (e) {
      this.emitError('Could Not Get Balance', EVENT_CODES.BALANCE_ERROR, e);
      return null;
    }
  }
}
