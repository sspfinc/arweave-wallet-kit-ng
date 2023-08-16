import { Attribute, Component, Input, Optional } from '@angular/core';
import { ArweaveWalletKitNgService } from '../../arweave-wallet-kit-ng.service';
import { EVENT_CODES } from '../../types';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'awk-connect-button',
  templateUrl: './connect-button.component.html',
  styleUrls: ['./connect-button.component.scss'],
})
export class ConnectButtonComponent {
  @Input('label') public label: string = 'Connect Wallet';
  @Input('size') public size: ButtonSize = 'md';

  public isActive: boolean = true;

  constructor(
    private arweaveWalletKitNgService: ArweaveWalletKitNgService,
    @Optional() @Attribute('custom') public custom: any
  ) {
    this.arweaveWalletKitNgService.eventEmitterObservable.subscribe((event) => {
      if (event.code === EVENT_CODES.ACTIVE_ADDRESS) {
        this.isActive = false;
      } else if (event.code === EVENT_CODES.DISCONNECT) {
        this.isActive = true;
      }
    });
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
}
