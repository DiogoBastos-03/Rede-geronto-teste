import PageHeader from '../components/layout/PageHeader';
import Footer from '../components/layout/Footer';
import CidadeAmigaHero from '../components/sections/cidade-amiga/CidadeAmigaHero';
import OQueE from '../components/sections/cidade-amiga/OQueE';
import Fases from '../components/sections/cidade-amiga/Fases';
import Eixos from '../components/sections/cidade-amiga/Eixos';
import PilaresFundamentais from '../components/sections/cidade-amiga/PilaresFundamentais';
import EstrategiaBAPI from '../components/sections/cidade-amiga/EstrategiaBAPI';
import CidadeAmigaCTA from '../components/sections/cidade-amiga/CidadeAmigaCTA';

export default function CidadeAmiga() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <a
        href="#cidade-amiga-hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-deep focus:text-white focus:px-4 focus:py-2 focus:rounded-pill"
      >
        Pular para o conteúdo
      </a>
      <PageHeader
        pageName="Cidade Amiga do Idoso"
        links={[
          { label: 'O que é', href: '#o-que-e' },
          { label: 'As 4 Fases', href: '#fases' },
          { label: 'Os 8 Eixos', href: '#eixos' },
          { label: 'Pilares', href: '#pilares' },
          { label: 'Estratégia BAPI', href: '#bapi' },
        ]}
      />
      <main>
        <CidadeAmigaHero />
        <OQueE />
        <Fases />
        <Eixos />
        <PilaresFundamentais />
        <EstrategiaBAPI />
        <CidadeAmigaCTA />
      </main>
      <Footer />
    </div>
  );
}
