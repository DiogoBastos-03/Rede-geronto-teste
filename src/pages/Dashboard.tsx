import PageHeader from '../components/layout/PageHeader';
import Footer from '../components/layout/Footer';
import MapaDashboard from '../components/sections/dashboard/MapaDashboard';
import Referencias from '../components/sections/dashboard/Referencias';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <a
        href="#mapa"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-deep focus:text-white focus:px-4 focus:py-2 focus:rounded-pill"
      >
        Pular para o conteúdo
      </a>
      <PageHeader
        pageName="Dashboard"
        links={[
          { label: 'Mapa', href: '#mapa' },
          { label: 'Referências', href: '#referencias' },
        ]}
      />
      <main className="pt-[72px]">
        <MapaDashboard />
        <Referencias />
      </main>
      <Footer />
    </div>
  );
}
