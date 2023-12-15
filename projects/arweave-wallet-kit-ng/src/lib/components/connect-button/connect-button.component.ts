import {
  AfterViewInit,
  Attribute,
  Component,
  ElementRef,
  Input,
  Optional,
  Renderer2,
} from '@angular/core';
import { ArweaveWalletKitNgService } from '../../arweave-wallet-kit-ng.service';
import { EVENT_CODES } from '../../types';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'awk-connect-button',
  templateUrl: './connect-button.component.html',
})
export class ConnectButtonComponent {
  @Input() public label = 'Connect Wallet';
  @Input() public size: ButtonSize = 'md';

  public isActive = true;

  public loading = false;

  constructor(
    private arweaveWalletKitNgService: ArweaveWalletKitNgService,
    @Optional() @Attribute('custom') public custom: any,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.arweaveWalletKitNgService.eventEmitterObservable.subscribe(event => {
      switch (event.code) {
        case EVENT_CODES.TRY_CONNECT:
        case EVENT_CODES.TRY_ACTIVE_ADDRESS:
        case EVENT_CODES.ACTIVE_ADDRESS:
          this.renderer.setStyle(this.el.nativeElement, 'display', 'none');

          this.isActive = false;
          break;

        case EVENT_CODES.TRY_DISCONNECT:
          this.renderer.setStyle(this.el.nativeElement, 'display', 'block');

          this.isActive = true;
          this.loading = true;
          break;
        case EVENT_CODES.DISCONNECT:
          this.loading = false;
          break;
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
