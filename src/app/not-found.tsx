import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Notfound = () => {
  return (
      <div className=" bg-[#F3EBCE] min-h-screen relative  grid place-items-center max-w-full overflow-hidden">
      {/* Top-left SVG */}
      <div className='absolute top-16 left-20 hidden md:block z-0 opacity-60 '>
        <Image
            src={"/404one.svg"}
            alt='404'
            width={69}
            height={69}
        />
      </div>

      {/* Other floating SVGs */}
      <div className="absolute top-36 right-32 hidden md:block z-0 opacity-60 ">
        <Image
            src={"/404two.svg"}
            alt='404'
            width={107}
            height={107}
        />
      </div>
      <div className="absolute left-40 top-1/2 hidden md:block z-0 opacity-60 ">
        <Image
            src={"/404two.svg"}
            alt='404'
            width={107}
            height={107}
        />
      </div>
      <div className="absolute top-[65%] right-56 hidden md:block z-0 opacity-60 ">
        <Image
            src={"/404two.svg"}
            alt='404'
            width={107}
            height={107}
        />
      </div>

      {/* Centered content */}
      <div className="w-full px-4 text-center z-10">
        <h4 className='text-4xl md:text-6xl font-semibold mb-2'>Oops! Page Not Found</h4>

        <div className='flex items-center justify-center mb-2'>
          <h5 className='text-[180px] md:text-[274px] leading-none'>4</h5>
          <Image 
            src={"/404.svg"}
            alt="404 Illustration"
            width={150}
            height={150}
            className='w-[150px] md:w-[274px] h-auto'
          />
          <h5 className='text-[180px] md:text-[274px] leading-none'>4</h5>
        </div>

        <p className='text-base md:text-lg'>Looks like this page is as lost as a missing thread in our weave.</p>
        <p className='text-base md:text-lg mb-9'>But don’t worry—you can find your way back to something meaningful.</p>

        <div className='flex flex-wrap justify-center items-center gap-4 mb-8'>
          <Link href={"/dashboard"}>
            <button className='bg-[#CE9F41] text-primary underline-offset-4 px-4 py-3 rounded-md'>
                <span className='text-[#F7F6F3]'>Back to Dashboard</span>
            </button></Link>
        </div>

        <p className='text-[#878787]'>Every product you buy supports women in Nepal.</p>
      </div>
      </div>
  );
};

export default Notfound;
