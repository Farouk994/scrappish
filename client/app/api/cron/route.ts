/** @format */

import Product from "@/lib/models/product";
import { connectDb } from "@/lib/mongoose";
import { generateEmailBody, sendEmail } from "@/lib/node-mailer";
import { scrapAmazonProduct } from "@/lib/scraper";
import {
  getLowestPrice,
  getHighestPrice,
  getAveragePrice,
  getEmailNotifType,
} from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    connectDb();
    const products = await Product.find({});
    if (!products) {
      throw new Error("No products found");
    }

    // 1.SCRAP latest product details and update db
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapAmazonProduct(currentProduct.url);
        if (!scrapedProduct) throw new Error("Error in scraping product");

        // update price history
        const updatedPriceHistory = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          getHighestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          { url: scrapedProduct.url },
          product
        );

        // check each product status and send email accordingly
        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );
        if (emailNotifType && updatedProduct.users.length > 0) {
          // send email
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };

          const emailContent = await generateEmailBody(
            productInfo,
            emailNotifType
          );

          const userEmails = updatedProduct.users.map(
            (user: any) => user.email
          );

          // send email
          await sendEmail(emailContent, userEmails);
        }
        return updatedProduct;
      })
    );
    return NextResponse.json({
      message: "OK",
      data: updatedProducts,
    });
  } catch (error: any) {
    throw new Error(`Error in GET job: ${error}`);
  }
}
