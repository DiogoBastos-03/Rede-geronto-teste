import { createContext, useContext, useState, type ReactNode } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ContatoTipo =
  | 'Solicitar Consultoria'
  | 'Agendar Webinário'
  | 'Tirar Dúvidas'
  | 'Outro Assunto';

export interface ContatoPreset {
  /** Pre-select the contact type dropdown */
  tipo?: ContatoTipo;
  /** Pre-fill the message textarea */
  mensagem?: string;
}

interface ContatoContextType {
  isOpen: boolean;
  preset: ContatoPreset;
  openContato: (preset?: ContatoPreset) => void;
  closeContato: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ContatoContext = createContext<ContatoContextType | null>(null);

export function ContatoProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preset, setPreset] = useState<ContatoPreset>({});

  const openContato = (p?: ContatoPreset) => {
    setPreset(p ?? {});
    setIsOpen(true);
  };

  const closeContato = () => setIsOpen(false);

  return (
    <ContatoContext.Provider value={{ isOpen, preset, openContato, closeContato }}>
      {children}
    </ContatoContext.Provider>
  );
}

export function useContato(): ContatoContextType {
  const ctx = useContext(ContatoContext);
  if (!ctx) throw new Error('useContato must be used inside <ContatoProvider>');
  return ctx;
}
