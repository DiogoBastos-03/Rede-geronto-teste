import PageHeader from '../components/layout/PageHeader';
import Footer from '../components/layout/Footer';
import MapaFundos from '../components/sections/dashboard/MapaFundos';
import MunicipiosDIRPF from '../components/sections/dashboard/MunicipiosDIRPF';
import Referencias from '../components/sections/dashboard/Referencias';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <a
        href="#mapa-fundos"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-deep focus:text-white focus:px-4 focus:py-2 focus:rounded-pill"
      >
        Pular para o conteúdo
      </a>
      <PageHeader
        pageName="Dashboard"
        links={[
          { label: 'Mapa de Fundos', href: '#mapa-fundos' },
          { label: 'Municípios DIRPF', href: '#municipios-dirpf' },
          { label: 'Referências', href: '#referencias' },
        ]}
      />
      <main className="pt-[72px]">
        <MapaFundos />
        <MunicipiosDIRPF />
        <Referencias />
      </main>
      <Footer />
    </div>
  );
}
