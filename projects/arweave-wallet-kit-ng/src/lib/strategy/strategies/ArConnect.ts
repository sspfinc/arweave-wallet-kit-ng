import BrowserWalletStrategy from "./BrowserWallet";
import Strategy from "../Strategy";
import { callWindowApi } from "../../utils";

export default class ArConnectStrategy
  extends BrowserWalletStrategy
  implements Strategy
{
  public override id: string = "arconnect";
  public override name: string = "ArConnect";
  public override description: string =
    "Non-custodial Arweave wallet for your favorite browser";
  public override theme: string = "171 154 255";
  public override logo: string = "tQUcL4wlNj_NED2VjUGUhfCTJ6pDN9P0e3CbnHo3vUE";
  public url = "https://arconnect.io";

  constructor() {
    super();
  }

  public override async isAvailable() {
    const injectedAvailable = await super.isAvailable();

    if (!injectedAvailable) {
      return false;
    }

    return window.arweaveWallet.walletName === "ArConnect";
  }

  public override async addToken(id: string): Promise<void> {
    return await callWindowApi("addToken", [id]);
  }
}
