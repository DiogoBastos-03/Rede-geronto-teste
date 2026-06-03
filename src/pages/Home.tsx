import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import Problem from '../components/sections/Problem';
import Opportunity from '../components/sections/Opportunity';
import CityFriendly from '../components/sections/CityFriendly';
import Data from '../components/sections/Data';
import HowItWorks from '../components/sections/HowItWorks';
import Consulting from '../components/sections/Consulting';
import RecursosTeaser from '../components/sections/RecursosTeaser';
import FinalCTA from '../components/sections/FinalCTA';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-deep focus:text-white focus:px-4 focus:py-2 focus:rounded-pill"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Opportunity />
        <CityFriendly />
        <Data />
        <HowItWorks />
        <Consulting />
        <RecursosTeaser />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
