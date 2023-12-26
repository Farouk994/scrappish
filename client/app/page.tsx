/** @format */

import SearchBar from "@/components/SearchBar";
import HeroCarousel from "@/components/HeroCarousel";
import Image from "next/image";
import React from "react";

const Home = () => {
  return (
    <>
      <section className='px-6 md:px-20 py-24 border-2'>
        <div className='flex max-xl:flex-col gap-16'>
          <div className='flex flex-col justify-center'>
            <p className='small-text'>
              Smart Shopping Starts here:
              <Image
                src='/assets/icons/arrow-right.svg'
                alt='arrow-light'
                width={16}
                height={16}
              />
            </p>
            <h1 className='head-text'>
              Unleash your Power through{" "}
              <span className='text-primary'>Scrappish</span>
            </h1>
            <p className='mt-6'>
              Powerful, self-serve product data platform that provides you with
              the most accurate and up-to-date product data.
            </p>
          <SearchBar />
          </div>
        <HeroCarousel/>
        </div>
      </section>
      <section className='trending-section'>
        <h2 className='section-text'>Trending</h2>
        <div className='flex flex-wrap gap-x-8 gap-y-16'>
          {["Apple Iphone", "Book", "Sneakers"].map((product) => (
            <div>{product}</div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
