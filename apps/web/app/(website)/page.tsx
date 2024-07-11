import { ContainerScroll } from "@/components/ui/container-scoll-animation";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { WobbleCard } from "@/components/ui/wobble-cards";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="overflow-hidden bg-accent-background w-full">
        <MacbookScroll
          title={
            <span>
              This Macbook is built with Tailwindcss. <br /> No kidding.
            </span>
          }
          badge={null}
          src={`/salesdemo.mp4`}
          showGradient={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full py-48">
        <WobbleCard
          containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
          className=""
        >
          <div className="max-w-xs">
            <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              Perfect Sales Assistant
            </h2>
            <p className="mt-4 text-left  text-base/6 text-neutral-200">
              Fully customise your AI sales assistant to match your unique style
              and customer needs.
            </p>
          </div>
          <Image
            src="/card1.png"
            width={500}
            height={500}
            alt="linear demo image"
            className="absolute -right-4 lg:-right-[20%] grayscale filter -bottom-10 object-contain rounded-2xl top-[0%] scale-[75%] contrast-150"
          />
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 min-h-[300px]">
          <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Embed Anywhere
          </h2>
          <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
            Easily integrate your chatbot into your website with a link that
            only works for you.
          </p>
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
          <div className="max-w-sm">
            <h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              Train your sales AI assistant on you own data.
            </h2>
            <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200"></p>
          </div>
          <Image
            src="/card2.png"
            width={500}
            height={500}
            alt="linear demo image"
            className="absolute -right-10 md:-right-[10%] lg:-right-[10%] -bottom-10 object-contain rounded-2xl grayscale contrast-150 scale-[60%] -top-[40%]"
          />
        </WobbleCard>
      </div>
    </div>
  );
}
