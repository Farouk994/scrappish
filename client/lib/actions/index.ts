/** @format */

"use server";

import { scrapAmazonProduct } from "../scraper/index";

export async function scrapAndStoreProduct(productUrl: string) {
  if (!productUrl) return;
  try {
    const scrapedProduct = await scrapAmazonProduct(productUrl);
    // return scrapedProduct;
  } catch (error: any) {
    // throw new Error("Failed to create/Update product");
    console.log(error.message);
  }
}
