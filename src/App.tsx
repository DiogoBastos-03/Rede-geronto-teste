import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import CidadeAmiga from './pages/CidadeAmiga';
import Consultoria from './pages/Consultoria';
import Dashboard from './pages/Dashboard';

const Placeholder = ({ title }: { title: string }) => (
  <main className="min-h-screen flex items-center justify-center bg-bg-primary px-6">
    <div className="text-center">
      <p className="text-caption uppercase tracking-[1.2px] text-blue-deep mb-3">
        Em breve
      </p>
      <h1 className="text-h2 md:text-display font-medium text-text-primary mb-4">
        {title}
      </h1>
      <p className="text-body text-text-secondary max-w-md mx-auto">
        Esta página está em construção. Volte em breve.
      </p>
      <a
        href="/"
        className="inline-block mt-8 px-6 py-3 rounded-pill bg-blue-deep text-white hover:bg-[#0a3f78] transition-colors"
      >
        Voltar para o início
      </a>
    </div>
  </main>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cidade-amiga" element={<CidadeAmiga />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/diagnostico" element={<Placeholder title="Diagnóstico Gratuito" />} />
      <Route path="/consultoria" element={<Consultoria />} />
      <Route path="/recursos" element={<Placeholder title="Biblioteca de Recursos" />} />
      <Route path="/contato" element={<Placeholder title="Contato" />} />
      <Route path="*" element={<Placeholder title="Página não encontrada" />} />
    </Routes>
  );
}
