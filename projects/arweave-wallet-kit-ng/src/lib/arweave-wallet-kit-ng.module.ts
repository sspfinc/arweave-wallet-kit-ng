import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { ArweaveWalletKitNgService } from './arweave-wallet-kit-ng.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule],
  providers: [ArweaveWalletKitNgService],
})
export class ArweaveWalletKitNgModule {
  /**
   * ArweaveWalletKitNgModule Constructor For Preventing Multiple Imports
   * @param parentModule - ArweaveWalletKitNgModule
   */
  constructor(@Optional() @SkipSelf() parentModule?: ArweaveWalletKitNgModule) {
    if (parentModule) {
      throw new Error(
        'ArweaveWalletKitNgModule is already loaded. Import it in the only once using .forRoot()!'
      );
    }
  }

  /**
   * ForRoot Function For Importing ArweaveWalletKitNgModule
   * @returns ModuleWithProviders<ArweaveWalletKitNgModule>
   */
  public static forRoot(): ModuleWithProviders<ArweaveWalletKitNgModule> {
    return {
      ngModule: ArweaveWalletKitNgModule,
      providers: [ArweaveWalletKitNgService],
    };
  }
}
