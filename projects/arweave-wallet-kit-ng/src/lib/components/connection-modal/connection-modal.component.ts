import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { AppInfo, PermissionType } from 'arconnect';

import { Subscription } from 'rxjs';
import { ArweaveWalletKitNgService } from '../../arweave-wallet-kit-ng.service';
import Strategy from '../../strategy/Strategy';
import ArConnectStrategy from '../../strategy/strategies/ArConnect';
import ArweaveWebWalletStrategy from '../../strategy/strategies/ArweaveWebWallet';
import OthentStrategy from '../../strategy/strategies/Othent';
import { EVENT_CODES } from '../../types';

@Component({
  selector: 'awk-connection-modal',
  templateUrl: './connection-modal.component.html',
})
export class ConnectionModalComponent implements AfterViewInit, OnDestroy {
  /**
   * Strategies For Connecting To Wallet (ARCONNECT, WEB_WALLET, OTHENT)
   */
  public strategies: Strategy[] = [
    new ArConnectStrategy(),
    new ArweaveWebWalletStrategy(),
    new OthentStrategy(),
  ];

  /**
   * Inputs For ArKitNgComponent (Permissions, AppInfo, Local)
   */
  @Input({ required: true }) permissions!: PermissionType[];
  @Input({ required: false }) appInfo!: AppInfo;
  @Input({ required: false }) local!: boolean;

  /**
   * View Children For ArKitNgComponent (Modal, Modal Backdrop)
   */
  @ViewChild('modal', { static: true }) modal!: ElementRef;
  @ViewChild('modal_backdrop', { static: true }) modal_backdrop!: ElementRef;

  @ViewChild('resume_popup', { static: true }) resume_popup!: ElementRef;
  @ViewChild('resume_backdrop', { static: true }) resume_backdrop!: ElementRef;

  /**
   * Event Subscription For ArKitNgComponent (Event Emitter)
   */
  private eventSubscription!: Subscription;

  /**
   * ArKitNgComponent Constructor Injecting ArKitNgService And Renderer2
   * @param arKitNg - ArKitNgService For Connecting To Wallet
   * @param renderer - Renderer2 For Adding/Removing Classes
   */
  constructor(
    private arweaveWalletKitNgService: ArweaveWalletKitNgService,
    private renderer: Renderer2
  ) {}

  /**
   * Initialize ArKitNgComponent After View Init
   * @returns Promise<void>
   */
  async ngAfterViewInit(): Promise<void> {
    await this.arweaveWalletKitNgService.init(
      this.appInfo,
      this.strategies,
      this.permissions
    );

    // Listen For Events and Handle Them Accordingly
    this.eventSubscription =
      this.arweaveWalletKitNgService.eventEmitterObservable.subscribe(
        async (event) => {
          switch (event.code) {
            case EVENT_CODES.RESUME:
              this.renderer.removeClass(
                this.resume_popup.nativeElement,
                'opened'
              );

              await this.arweaveWalletKitNgService.getActiveAddress();

              break;
            case EVENT_CODES.READY:
            case EVENT_CODES.CONNECT:
              this.arweaveWalletKitNgService.setIsActive(false);

              await this.arweaveWalletKitNgService.getActiveAddress();

              break;

            case EVENT_CODES.MODAL:
              if (event.data === true) {
                this.renderer.addClass(this.modal.nativeElement, 'opened');
              } else {
                this.renderer.removeClass(this.modal.nativeElement, 'opened');
              }
              break;

            case EVENT_CODES.CAN_RESUME:
              setTimeout(() => {
                this.renderer.addClass(
                  this.resume_popup.nativeElement,
                  'opened'
                );
              }, 1);
              break;

            case EVENT_CODES.DISCONNECT:
              this.renderer.removeClass(
                this.resume_popup.nativeElement,
                'opened'
              );
              break;
          }
        }
      );

    // Close modal when clicking on backdrop
    this.renderer.listen(this.modal_backdrop.nativeElement, 'click', () => {
      this.arweaveWalletKitNgService.setIsActive(false);
    });
  }

  /**
   * Destroy ArKitNgComponent And Unsubscribe From Event Emitter
   * @returns Promise<void>
   */
  async ngOnDestroy(): Promise<void> {
    this.eventSubscription.unsubscribe();
  }

  /**
   * Open Modal For Connecting To Wallet
   * @returns void
   */
  public open(): void {
    this.arweaveWalletKitNgService.setIsActive(true);
  }

  /**
   * Close Modal For Connecting To Wallet
   * @returns void
   */
  public close(): void {
    this.arweaveWalletKitNgService.setIsActive(false);
  }

  /**
   * Connect To Wallet
   * @param type - Wallet Type To Connect To (ARCONNECT, WEB_WALLET, OTHENT)
   * @returns Promise<void>
   */
  public async connect(strategy: Strategy): Promise<void> {
    await this.arweaveWalletKitNgService.connect(strategy);
  }

  /**
   * Disconnect From Wallet
   * @returns Promise<void>
   */
  public async disconnect(): Promise<void> {
    await this.arweaveWalletKitNgService.disconnect();
  }

  /**
   * Reconnect To Wallet
   * @returns Promise<void>
   */
  public async resume(): Promise<void> {
    await this.arweaveWalletKitNgService.resume();
  }
}
