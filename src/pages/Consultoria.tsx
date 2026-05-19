import PageHeader from '../components/layout/PageHeader';
import Footer from '../components/layout/Footer';
import ConsultoriaHero from '../components/sections/consultoria/ConsultoriaHero';
import Diferenciais from '../components/sections/consultoria/Diferenciais';
import Pacotes from '../components/sections/consultoria/Pacotes';
import Formulario from '../components/sections/consultoria/Formulario';
import ConsultoriaCTA from '../components/sections/consultoria/ConsultoriaCTA';

export default function Consultoria() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <a
        href="#consultoria-hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-blue-deep focus:text-white focus:px-4 focus:py-2 focus:rounded-pill"
      >
        Pular para o conteúdo
      </a>
      <PageHeader
        pageName="Consultoria"
        links={[
          { label: 'Diferenciais', href: '#diferenciais' },
          { label: 'Pacotes', href: '#pacotes' },
          { label: 'Solicitar Proposta', href: '#formulario' },
        ]}
      />
      <main>
        <ConsultoriaHero />
        <Diferenciais />
        <Pacotes />
        <Formulario />
        <ConsultoriaCTA />
      </main>
      <Footer />
    </div>
  );
}
