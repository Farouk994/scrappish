/** @format */

"use server";

import Product from "../models/product";
import { connectDb } from "../mongoose";
import { scrapAmazonProduct } from "../scraper/index";
import { getHighestPrice, getLowestPrice, getAveragePrice } from "../utils";
import { revalidatePath } from "next/cache";

export async function scrapAndStoreProduct(productUrl: string) {
  if (!productUrl) return;
  try {
    connectDb();
    const scrapedProduct = await scrapAmazonProduct(productUrl);
    if (!scrapedProduct) return;
    console.log("object", scrapedProduct);

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: product.url });

    if (existingProduct) {
      const updatedPriceHistory = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        getHighestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`)

    // if we have a product, we can store it in the database
    // const product = {
    //   ...scrapedProduct,
    //   url: productUrl,
    // };
    // return scrapedProduct;
  } catch (error: any) {
    // throw new Error("Failed to create/Update product");
    console.log(error.message);
  }
}
