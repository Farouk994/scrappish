/** @format */

"use server";

import { User } from "@/types";
import Product from "../models/product";
import { connectDb } from "../mongoose";
import { scrapAmazonProduct } from "../scraper/index";
import { getHighestPrice, getLowestPrice, getAveragePrice } from "../utils";
import { revalidatePath } from "next/cache";
import { generateEmailBody, sendEmail } from "../node-mailer";

export async function scrapAndStoreProduct(productUrl: string) {
  if (!productUrl) return;
  try {
    connectDb();
    const scrapedProduct = await scrapAmazonProduct(productUrl);
    if (!scrapedProduct) return;
    console.log("object", scrapedProduct);

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);

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

// fetch product based on id

export async function getProductById(productId: string) {
  try {
    connectDb();
    const product = await Product.findById(productId);
    if (!product) return null;
    return product;
  } catch (error: any) {
    console.log(error.message);
  }
}

export async function getAllProducts() {
  try {
    connectDb();
    const products = await Product.find();
    if (!products) return null;
    return products;
  } catch (error: any) {
    console.log(error.message);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    connectDb();
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: {$ne: productId}
    }).limit(4)
    return similarProducts;
  } catch (error: any) {
    console.log(error.message);
  }
}

export async function addUserEmailToProduct(productId:string, userEmail:string){
  try {
    const product = await Product.findById(productId);
    if(!product) return;
    
    const userExists = product.users.some((user: User) => user.email === userEmail);
    if(!userExists){
      product.users.push({email: userEmail});
      await product.save();
      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error)
  }
}

