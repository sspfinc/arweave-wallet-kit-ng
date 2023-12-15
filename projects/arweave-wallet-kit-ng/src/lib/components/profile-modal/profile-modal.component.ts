import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Subscription, firstValueFrom } from 'rxjs';
import { ArweaveWalletKitNgService } from '../../arweave-wallet-kit-ng.service';
import { EVENT_CODES } from '../../types';
import { formatAddress } from '../../utils';
import { ButtonSize } from '../connect-button';

const GET_PROFILE = gql`
  query Transactions($owners: [String!]) {
    transactions(
      tags: [{ name: "Protocol-Name", values: ["Account-0.2", "Account-0.3"] }]
      first: 1
      owners: $owners
    ) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'awk-profile-modal',
  templateUrl: './profile-modal.component.html',
})
export class ProfileModalComponent implements AfterViewInit, OnDestroy {
  @Input() public size: ButtonSize = 'md';

  public loading = true;

  public handle!: string | undefined;
  public avatar!: string | undefined;
  public balance!: number | null;
  public address: string | undefined;
  public display_address: string | undefined;
  public long_address: string | undefined;

  public isActive = false;

  private querySubscription!: Subscription;

  /**
   * View Children For ArKitNgComponent (Modal, Modal Backdrop)
   */
  @ViewChild('profile', { static: true }) modal!: ElementRef;
  @ViewChild('profile_backdrop', { static: true }) modal_backdrop!: ElementRef;

  /**
   * Event Subscription For ArKitNgComponent (Event Emitter)
   */
  private eventSubscription!: Subscription;
  constructor(
    private arweaveWalletKitNgService: ArweaveWalletKitNgService,
    private renderer: Renderer2,
    private el: ElementRef,
    private apollo: Apollo,
    private http: HttpClient
  ) {}

  async ngAfterViewInit(): Promise<void> {
    this.renderer.setStyle(this.el.nativeElement, 'display', 'none');

    // Listen For Events and Handle Them Accordingly
    this.eventSubscription =
      this.arweaveWalletKitNgService.eventEmitterObservable.subscribe(
        async event => {
          switch (event.code) {
            case EVENT_CODES.ACTIVE_ADDRESS:
              this.loading = false;
              this.address = event.data;
              this.display_address = formatAddress(event.data, 4);
              this.long_address = formatAddress(event.data, 8);

              if (this.address) {
                this.balance = await this.arweaveWalletKitNgService.getBalance(
                  this.address
                );
                this.querySubscription = this.apollo
                  .watchQuery({
                    query: GET_PROFILE,
                    variables: {
                      owners: this.address,
                    },
                  })
                  .valueChanges.subscribe(async ({ data }: any) => {
                    if (!data.transactions.edges.length) return;
                    const node = data.transactions.edges[0].node;
                    const response = (await firstValueFrom(
                      this.http.get(`https://arweave.net/${node.id}`)
                    )) as any;
                    const avatar = (response.avatar as string).replace(
                      'ar://',
                      ''
                    );
                    this.avatar = `https://arweave.net/${avatar}`;
                    this.handle = response.handle;
                    console.log(response);
                  });
              }
              break;
            case EVENT_CODES.TRY_ACTIVE_ADDRESS:
            case EVENT_CODES.TRY_CONNECT:
              this.isActive = true;
              this.renderer.setStyle(this.el.nativeElement, 'display', 'block');
              this.loading = true;
              break;
            case EVENT_CODES.TRY_DISCONNECT:
            case EVENT_CODES.DISCONNECT:
            case EVENT_CODES.CONNECT_ERROR:
              this.loading = false;
              this.reset();

              break;
          }
          console.log(event);
        }
      );

    // Close modal when clicking on backdrop
    this.renderer.listen(this.modal_backdrop.nativeElement, 'click', () => {
      this.close();
    });
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
    }
  }

  private reset(): void {
    this.handle = undefined;
    this.avatar = undefined;
    this.address = undefined;
    this.display_address = undefined;
    this.long_address = undefined;
    this.isActive = false;
    this.renderer.setStyle(this.el.nativeElement, 'display', 'none');

    this.close();
  }

  public open() {
    this.renderer.addClass(this.modal.nativeElement, 'opened');
  }

  public close() {
    this.renderer.removeClass(this.modal.nativeElement, 'opened');
  }

  /**
   * Disconnect From Wallet
   * @returns Promise<void>
   */
  public async disconnect(): Promise<void> {
    await this.arweaveWalletKitNgService.disconnect();
  }

  copyToClipboard(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }
}
