import PageHeader from '../components/layout/PageHeader';
import Footer from '../components/layout/Footer';
import DashboardHero from '../components/sections/dashboard/DashboardHero';
import MapaFundos from '../components/sections/dashboard/MapaFundos';
import MunicipiosDIRPF from '../components/sections/dashboard/MunicipiosDIRPF';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <a
        href="#dashboard-hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-deep focus:text-white focus:px-4 focus:py-2 focus:rounded-pill"
      >
        Pular para o conteúdo
      </a>
      <PageHeader
        pageName="Dashboard"
        links={[
          { label: 'Mapa de Fundos', href: '#mapa-fundos' },
          { label: 'Municípios Habilitados', href: '#municipios' },
        ]}
      />
      <main>
        <DashboardHero />
        <MapaFundos />
        <MunicipiosDIRPF />
      </main>
      <Footer />
    </div>
  );
}
