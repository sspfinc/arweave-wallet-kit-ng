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
  selector: 'awk-connect-button',
  templateUrl: './connect-button.component.html',
})
export class ConnectButtonComponent implements AfterViewInit {
  @Input('label') public label: string = 'Connect Wallet';
  @Input('size') public size: ButtonSize = 'md';

  public isActive: boolean = true;

  public loading: boolean = false;

  constructor(
    private arweaveWalletKitNgService: ArweaveWalletKitNgService,
    @Optional() @Attribute('custom') public custom: any,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.arweaveWalletKitNgService.eventEmitterObservable.subscribe((event) => {
      switch (event.code) {
        case EVENT_CODES.TRY_CONNECT:
          this.loading = true;
          break;
        case EVENT_CODES.CONNECT:
          this.loading = false;
          break;
        case EVENT_CODES.ACTIVE_ADDRESS:
          this.renderer.setStyle(this.el.nativeElement, 'display', 'none');

          this.isActive = false;
          break;
        case EVENT_CODES.TRY_DISCONNECT:
          this.renderer.setStyle(this.el.nativeElement, 'display', 'block');

          this.isActive = true;
          break;
      }
    });
  }
  ngAfterViewInit(): void {}
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
