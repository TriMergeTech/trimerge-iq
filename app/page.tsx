// app/page.tsx (SERVER COMPONENT)

import HomeClient from "./home_client";
import HomePage from "./home";

import BrandHeader from "./sections/brandng_section";
import HeroSection from "./sections/hero_section";
import FeaturesSection from "./sections/features_section";
import IllustrationSection from "./sections/illustration_section";
import CTASection from "./sections/landing_cta";

import Emitter from "semitter";

let emitter = new Emitter();

export default function Page() {
  return (
    <HomeClient HomePage={HomePage}>
      <main className="w-full bg-white">
        <BrandHeader />
        <HeroSection />
        <FeaturesSection />
        <IllustrationSection />
        <CTASection />
      </main>
    </HomeClient>
  );
}

export { emitter };
