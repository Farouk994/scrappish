/** @format */

import * as cheerio from "cheerio";
import axios from "axios";
import { extractCurrency, extractDescription, extractPrice } from "../utils";

export async function scrapAmazonProduct(url: string) {
  if (!url) return;

  // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_771a062f-zone-unblocker:o4ezf5ge5mbm -k https://lumtest.com/myip.json

  // bright data proxy configuration
  const username = String(process.env.BD_USERNAME);
  const password = String(process.env.BD_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io:22225",
    port,
    rejectUnauthorized: false,
  };

  try {
    // fetch the product page
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();

    // extract the price
    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $("a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base"),
      $(".a-price.a-text-price")
    );

    // extract the original price
    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    // extract the availability
    const outOfStock =
      $("#availability span .a-color-state").text().trim().toLowerCase() ===
      "currently unavailable";

    // extract the image
    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";

    // parse the image string to get the url
    // this will return an object with a single key-value pair where the key is the url
    const imageUrls = Object.keys(JSON.parse(images))[0];

    // currency
    const currency = extractCurrency($(".a-price-symbol"));
    const discountRate = $(".savingsPercentage").text().trim().slice(0, 3);
    // remove % sign
    // replace(/[-%]/g, "")

    // description
    const description = extractDescription($);

    // rating
    const rating = $("span.a-size-base.a-color-base");

    // construct data object with scraped info
    const data = {
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      outOfStock,
      image: imageUrls,
      discountRate,
      category: "category",
      priceHistory: [],
      currency: currency || "$",
      isOutOfStock: outOfStock,
      description: description,
      lowerPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };
    return data;
  } catch (error: any) {
    throw new Error("Failed to create/Update product: " + error.message);
  }
}
// https://www.amazon.ca/Mutual-Industries-14981-0-3-Bulk-Bag/dp/B006JHK9A4/ref=sr_1_5?crid=3BB7IWH8Z01VW&keywords=3ler+bags&qid=1703616483&sprefix=3ler+bags%2Caps%2C104&sr=8-5
