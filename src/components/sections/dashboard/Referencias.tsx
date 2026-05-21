import {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Info,
  Search,
} from 'lucide-react';
import SectionLabel from '../../ui/SectionLabel';
import { formatCNPJ } from './types';
import { useReferencias } from './useDashboardData';
import type { Referencia } from './types';
import Skeleton from './Skeleton';

type SortKey = 'uf' | 'municipio' | 'tipo' | 'nomeFundo' | 'codigoIBGE';
type TipoFilter = 'Todos' | 'Municipal' | 'Estadual';

const PER_PAGE = 50;

// ── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  value: number;
  label: string;
}

function StatCard({ value, label }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        card,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
        },
      );

      if (numRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: value,
          duration: 1.6,
          ease: 'power2.out',
          delay: 0.3,
          immediateRender: false,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
          onUpdate() {
            if (numRef.current) {
              numRef.current.textContent = Math.round(obj.val).toLocaleString(
                'pt-BR',
              );
            }
          },
        });
      }
    }, card);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [value]);

  const gradientStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline-block',
  };

  return (
    <div
      ref={cardRef}
      className="rounded-[20px] bg-white p-6 flex flex-col justify-between"
      style={{
        border: '1px solid rgba(12,74,140,0.08)',
        boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
      }}
    >
      <span
        ref={numRef}
        className="text-[40px] lg:text-[44px] leading-none tracking-[-0.03em] font-extrabold"
        style={gradientStyle}
      >
        0
      </span>
      <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
        {label}
      </p>
    </div>
  );
}

// ── TipoBadge ────────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: string }) {
  const style: CSSProperties =
    tipo === 'Estadual'
      ? { backgroundColor: '#EAF4F0', color: '#085041' }
      : { backgroundColor: '#E8F2FB', color: '#0C447C' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-badge text-[11px] font-medium"
      style={style}
    >
      {tipo}
    </span>
  );
}

// ── SortableHeader ────────────────────────────────────────────────────────────

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onSort,
  width,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
  width?: string;
}) {
  const active = current === sortKey;
  return (
    <th scope="col" className="text-left px-4 py-3" style={{ width }}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-sort={
          active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'
        }
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[1.2px] font-medium hover:text-blue-deep transition-colors whitespace-nowrap"
        style={{ color: active ? '#0C4A8C' : '#5F5E5A' }}
      >
        {label}
        <ArrowUpDown size={11} aria-hidden="true" />
      </button>
    </th>
  );
}

// ── TableRow ─────────────────────────────────────────────────────────────────

function TableRow({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const ref = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(
      ref.current,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.4, delay, ease: 'power2.out' },
    );
  }, [delay]);
  return (
    <tr ref={ref} className="hover:bg-blue-light/30 transition-colors">
      {children}
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Referencias() {
  const { data, loading } = useReferencias();

  const sectionRef = useRef<HTMLElement | null>(null);

  const [search, setSearch] = useState('');
  const [filterUF, setFilterUF] = useState('Todos');
  const [tipo, setTipo] = useState<TipoFilter>('Todos');
  const [sortKey, setSortKey] = useState<SortKey>('uf');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // Reset page on filter/sort change
  useEffect(() => setPage(1), [search, filterUF, tipo, sortKey, sortDir]);

  const ufs = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((r) => r.uf))).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.filter((r: Referencia) => {
      if (filterUF !== 'Todos' && r.uf !== filterUF) return false;
      if (tipo !== 'Todos' && r.tipo !== tipo) return false;
      if (
        q &&
        !r.municipio.toLowerCase().includes(q) &&
        !r.nomeFundo.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [data, search, filterUF, tipo]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      const cmp = av.localeCompare(bv, 'pt-BR');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const pageItems = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir('asc');
    }
  };

  const downloadCSV = () => {
    const headers = [
      'UF',
      'Município',
      'Tipo',
      'Nome do Fundo',
      'CNPJ',
      'Código IBGE',
    ];
    const escape = (s: string) => {
      const v = s.replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${v}"` : v;
    };
    const lines = [
      headers.join(','),
      ...sorted.map((r) =>
        [r.uf, r.municipio, r.tipo, r.nomeFundo, r.cnpj, r.codigoIBGE]
          .map(escape)
          .join(','),
      ),
    ];
    const blob = new Blob(['﻿' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referencias-dirpf-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // GSAP: stat cards on data load
  useEffect(() => {
    if (!data) return;
    const ctx = gsap.context(() => {
      // Nothing extra needed — StatCard handles its own animation
    }, sectionRef);
    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [data]);

  return (
    <section
      id="referencias"
      ref={sectionRef}
      aria-labelledby="referencias-heading"
      className="relative py-[120px] lg:py-[140px] bg-white"
    >
      <div className="container-x">
        {/* ── Section header ── */}
        <div className="max-w-3xl mb-10 lg:mb-12">
          <SectionLabel>
            Dados públicos — Fonte: MDH / Receita Federal do Brasil
          </SectionLabel>
          <h2
            id="referencias-heading"
            className="mt-5 text-[28px] sm:text-[36px] lg:text-[40px] font-medium leading-[1.15] tracking-[-0.02em] text-text-primary"
          >
            Referências de Fundos Habilitados para DIRPF
          </h2>
          <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.65] text-text-secondary">
            Lista oficial dos Fundos dos Direitos da Pessoa Idosa (FDI)
            habilitados para receber doações via Declaração do Imposto de Renda
            — Pessoa Física (DIRPF 2025), conforme publicado pelo Ministério dos
            Direitos Humanos e da Cidadania em conjunto com a Receita Federal do
            Brasil.
          </p>
        </div>

        {/* ── Transparency note ── */}
        <div
          className="rounded-[16px] p-5 flex items-start gap-4 mb-10"
          style={{
            backgroundColor: '#EBF4FF',
            border: '1px solid rgba(12,74,140,0.12)',
          }}
        >
          <Info
            size={20}
            aria-hidden="true"
            className="shrink-0 mt-0.5"
            style={{ color: '#0C4A8C' }}
          />
          <p className="text-[14px] leading-[1.7]" style={{ color: '#4A5568' }}>
            Os fundos listados abaixo são entidades públicas independentes,
            cadastradas junto ao MDH e habilitadas pela Receita Federal. A Rede
            Geronto não possui vínculo institucional com nenhum dos fundos
            relacionados nesta página. Os dados são reproduzidos exclusivamente
            para fins informativos e de referência técnica.
          </p>
        </div>

        {/* ── 4 stat cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={130} rounded="20px" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard value={2185} label="Fundos habilitados" />
            <StatCard value={2161} label="Fundos municipais" />
            <StatCard value={24} label="Fundos estaduais + DF" />
            <StatCard value={27} label="Unidades da federação" />
          </div>
        )}

        {/* ── Filters ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
          {/* Search */}
          <div className="md:col-span-5">
            <label
              htmlFor="ref-search"
              className="block text-[11px] uppercase tracking-[1.2px] font-medium mb-1.5"
              style={{ color: '#5F5E5A' }}
            >
              Buscar
            </label>
            <div className="relative">
              <Search
                size={16}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#5F5E5A' }}
              />
              <input
                id="ref-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Município ou nome do fundo..."
                className="w-full rounded-input pl-10 pr-3 py-2.5 text-[14px] outline-none"
                style={{
                  border: '1px solid #B5D4F4',
                  backgroundColor: '#ffffff',
                  color: '#2C2C2A',
                }}
              />
            </div>
          </div>

          {/* UF dropdown */}
          <div className="md:col-span-3">
            <label
              htmlFor="ref-uf"
              className="block text-[11px] uppercase tracking-[1.2px] font-medium mb-1.5"
              style={{ color: '#5F5E5A' }}
            >
              Estado (UF)
            </label>
            <div className="relative">
              <select
                id="ref-uf"
                value={filterUF}
                onChange={(e) => setFilterUF(e.target.value)}
                className="w-full appearance-none rounded-input px-3.5 py-2.5 pr-9 text-[14px] outline-none cursor-pointer"
                style={{
                  border: '1px solid #B5D4F4',
                  backgroundColor: '#ffffff',
                  color: '#2C2C2A',
                }}
              >
                <option value="Todos">Todos</option>
                {ufs.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#5F5E5A' }}
              />
            </div>
          </div>

          {/* Tipo toggle */}
          <div className="md:col-span-4 flex flex-col">
            <p
              className="text-[11px] uppercase tracking-[1.2px] font-medium mb-1.5"
              style={{ color: '#5F5E5A' }}
            >
              Tipo
            </p>
            <div
              role="group"
              aria-label="Filtrar por tipo de fundo"
              className="inline-flex p-0.5 rounded-pill self-start"
              style={{
                backgroundColor: '#E8F2FB',
                border: '1px solid rgba(12,74,140,0.12)',
              }}
            >
              {(['Todos', 'Municipal', 'Estadual'] as TipoFilter[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    aria-pressed={tipo === t}
                    className="px-3.5 py-1.5 rounded-pill text-[12px] font-medium transition-colors"
                    style={{
                      backgroundColor: tipo === t ? '#FFFFFF' : 'transparent',
                      color: tipo === t ? '#0C4A8C' : '#5F5E5A',
                      boxShadow:
                        tipo === t
                          ? '0 1px 3px rgba(12,74,140,0.12)'
                          : 'none',
                    }}
                  >
                    {t}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ── Result count + CSV button ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <p
            className="text-[13px]"
            style={{ color: '#5F5E5A' }}
            aria-live="polite"
          >
            <strong className="text-text-primary">
              {sorted.length.toLocaleString('pt-BR')}
            </strong>{' '}
            registro{sorted.length === 1 ? '' : 's'} encontrado
            {sorted.length === 1 ? '' : 's'}
          </p>
          <button
            type="button"
            onClick={downloadCSV}
            disabled={loading || sorted.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-pill px-5 py-2.5 text-[13px] font-medium text-white transition-shadow hover:shadow-[0_10px_28px_rgba(12,74,140,0.45)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #0C4A8C, #2196C9)',
              boxShadow: '0 4px 14px rgba(12,74,140,0.35)',
            }}
          >
            <Download size={14} aria-hidden="true" />
            Baixar CSV
          </button>
        </div>

        {/* ── Table ── */}
        <div
          className="rounded-[16px] bg-white overflow-hidden mb-12"
          style={{
            border: '1px solid rgba(12,74,140,0.08)',
            boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[860px]">
              <caption className="sr-only">
                Lista oficial de fundos habilitados para DIRPF 2025
              </caption>
              <thead>
                <tr style={{ backgroundColor: '#F7F9FC' }}>
                  <SortableHeader
                    label="UF"
                    sortKey="uf"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                    width="70px"
                  />
                  <SortableHeader
                    label="Município"
                    sortKey="municipio"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                  />
                  <SortableHeader
                    label="Tipo"
                    sortKey="tipo"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                    width="110px"
                  />
                  <SortableHeader
                    label="Nome do Fundo"
                    sortKey="nomeFundo"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                  />
                  <th
                    scope="col"
                    className="text-left text-[11px] uppercase tracking-[1.2px] font-medium px-4 py-3 whitespace-nowrap"
                    style={{ color: '#5F5E5A' }}
                  >
                    CNPJ
                  </th>
                  <SortableHeader
                    label="Cód. IBGE"
                    sortKey="codigoIBGE"
                    current={sortKey}
                    dir={sortDir}
                    onSort={toggleSort}
                    width="110px"
                  />
                </tr>
              </thead>
              <tbody
                key={`${page}-${sortKey}-${sortDir}-${filterUF}-${tipo}-${search}`}
                className="divide-y"
                style={{ borderColor: 'rgba(12,74,140,0.06)' }}
              >
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3" colSpan={6}>
                        <Skeleton height={16} />
                      </td>
                    </tr>
                  ))
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-text-secondary"
                    >
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((r, idx) => (
                    <TableRow
                      key={`${r.codigoIBGE}-${idx}`}
                      delay={idx * 0.02}
                    >
                      <td
                        className="px-4 py-3 font-medium text-text-primary whitespace-nowrap"
                        style={{ width: '70px' }}
                      >
                        {r.uf}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {r.municipio}
                      </td>
                      <td className="px-4 py-3">
                        <TipoBadge tipo={r.tipo} />
                      </td>
                      <td className="px-4 py-3" style={{ color: '#5F5E5A' }}>
                        {r.nomeFundo}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[12px] whitespace-nowrap"
                        style={{ color: '#5F5E5A' }}
                      >
                        {formatCNPJ(r.cnpj)}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[12px]"
                        style={{ color: '#5F5E5A' }}
                      >
                        {r.codigoIBGE}
                      </td>
                    </TableRow>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px]"
            style={{
              borderTop: '1px solid rgba(12,74,140,0.06)',
              color: '#5F5E5A',
            }}
          >
            <span>
              Mostrando{' '}
              <strong className="text-text-primary">
                {sorted.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–
                {Math.min(page * PER_PAGE, sorted.length)}
              </strong>{' '}
              de{' '}
              <strong className="text-text-primary">
                {sorted.length.toLocaleString('pt-BR')}
              </strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Página anterior"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-blue-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-light"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className="text-text-primary font-medium">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Próxima página"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-blue-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-light"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Sobre os dados ── */}
        <div
          className="rounded-[16px] p-6 lg:p-8"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(12,74,140,0.10)',
            boxShadow: '0 4px 24px rgba(12,74,140,0.06)',
          }}
        >
          <h3 className="text-[17px] font-medium text-text-primary mb-3">
            Sobre os dados
          </h3>
          <p
            className="text-[14px] leading-[1.7] mb-5"
            style={{ color: '#5F5E5A' }}
          >
            Os dados desta página são extraídos do{' '}
            <strong className="text-text-primary font-medium">
              Ato Declaratório Executivo CODAR nº 02, de 12 de fevereiro de
              2025
            </strong>
            , publicado pela Receita Federal do Brasil. A lista é atualizada
            anualmente pelo MDH em conjunto com a Receita Federal.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.gov.br/mdh/pt-br/assuntos/pessoa-idosa/cadastramento-de-fundos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-[13px] font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: '#E8F2FB',
                color: '#0C4A8C',
                border: '1px solid rgba(12,74,140,0.15)',
              }}
            >
              <ExternalLink size={14} aria-hidden="true" />
              Portal MDH — Cadastramento de Fundos
            </a>
            <a
              href="https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=136840"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-[13px] font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: '#E8F2FB',
                color: '#0C4A8C',
                border: '1px solid rgba(12,74,140,0.15)',
              }}
            >
              <Download size={14} aria-hidden="true" />
              Baixar PDF original (ADE CODAR 02/2025)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
