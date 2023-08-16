/**
 * Beautify addresses
 *
 * @param address Address to beautify
 */
export function formatAddress(address: string, count = 13) {
  return (
    address.substring(0, count) +
    "..." +
    address.substring(address.length - count, address.length)
  );
}

/**
 * Call the window.arweaveWallet API and wait for it to be injected,
 * if it has not yet been injected.
 *
 * @param fn Function name
 * @param params Params
 * @returns API result
 */
export async function callWindowApi(fn: string, params: any[] = []) {
  // if it is already injected
  if (window?.arweaveWallet) {
    // @ts-expect-error
    return await window.arweaveWallet[fn as any](...params);
  }

  // if it has not yet been injected
  return new Promise((resolve, reject) =>
    window.addEventListener("arweaveWalletLoaded", async () => {
      try {
        // @ts-expect-error
        resolve(await window.arweaveWallet[fn as any](...params));
      } catch (e) {
        reject(e);
      }
    })
  );
}
