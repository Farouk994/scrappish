/** @format */

"use client";

import { scrapAndStoreProduct } from "@/lib/actions";
import React, { FormEvent, useState } from "react";

const isValidAmznProductUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // check if hostname is amazon.com or amazon.ca
    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.ca") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }
};

const SearchBar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  //   create loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isValidLink = isValidAmznProductUrl(searchPrompt);
    // alert(isValidLink ? "Valid Link" : "Invalid Link");
    if (!isValidLink) return alert("Please provide a valid product link");

    try {
      setIsLoading(true);
    //   scrap first product
    const product = await scrapAndStoreProduct(searchPrompt);
    } catch (error) {
        console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className='flex flex-wrap gap-4 mt-12' onSubmit={handleSubmit}>
      <input
        type='text'
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder='Enter product link'
        className='searchbar-input'
      />
      <button
        type='submit'
        className='searchbar-btn'
        disabled={searchPrompt === ""}>
        {isLoading ? "Loading..." : "Search"}
      </button>
    </form>
  );
};

export default SearchBar;
