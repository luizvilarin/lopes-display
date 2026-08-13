import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Icons } from "@/components/common/Icons";
import { placarService } from "@/services/placarService";
import { DEFAULT_SLIDES, type Slide } from "@/services/onboardingData";
import logoBranca from "@/assets/logo-branca.png";
import type { Unidade } from "@/types/placar";

interface CulturaLopesProps {
  activeUnitId: string;
}

export function CulturaLopes({ activeUnitId }: CulturaLopesProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [transitionSpeed, setTransitionSpeed] = useState(8000); // 8s padrão
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [previewUnitId, setPreviewUnitId] = useState<string>(activeUnitId);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressStartRef = useRef<number>(Date.now());
  const [progressPercent, setProgressPercent] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  // Carregar unidades e slides do localStorage
  useEffect(() => {
    async function loadData() {
      try {
        const units = await placarService.getUnidades();
        setUnidades(units);
      } catch (err) {
        console.error("Erro ao carregar unidades", err);
      }

      // Carregar slides
      const saved = localStorage.getItem("lopes_cultura_slides");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSlides(parsed.filter((s: Slide) => s.ativo).sort((a: Slide, b: Slide) => a.ordem - b.ordem));
        } catch {
          setSlides(DEFAULT_SLIDES.filter(s => s.ativo));
        }
      } else {
        setSlides(DEFAULT_SLIDES.filter(s => s.ativo));
      }
    }
    loadData();

    // Event listener para atualizações do admin
    const handleStorageChange = () => {
      const updated = localStorage.getItem("lopes_cultura_slides");
      if (updated) {
        try {
          const parsed = JSON.parse(updated);
          setSlides(parsed.filter((s: Slide) => s.ativo).sort((a: Slide, b: Slide) => a.ordem - b.ordem));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    // Também escuta evento customizado para o mesmo documento
    window.addEventListener("lopes_slides_updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("lopes_slides_updated", handleStorageChange);
    };
  }, []);

  // Sincronizar unidade de visualização
  useEffect(() => {
    setPreviewUnitId(activeUnitId);
  }, [activeUnitId]);

  const activeSlides = useMemo(() => {
    return slides.length > 0 ? slides : DEFAULT_SLIDES.filter(s => s.ativo);
  }, [slides]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  // Resolver nome da unidade
  const unitName = useMemo(() => {
    const targetId = previewUnitId === "Todas" || !previewUnitId ? "marista" : previewUnitId;
    const unit = unidades.find(u => u.id === targetId);
    if (!unit) return "Marista";
    return unit.nome.replace("Lopes ", "");
  }, [unidades, previewUnitId]);

  // Substituir variáveis dinâmicas no texto
  const replaceVariables = useCallback((text?: string) => {
    if (!text) return "";
    return text
      .replace(/{unidade}/g, unitName.toUpperCase())
      .replace(/{unidade_lowercase}/g, unitName.toLowerCase())
      .replace(/{unidade_normal}/g, unitName);
  }, [unitName]);

  // Avançar e Retroceder
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    setProgressPercent(0);
    progressStartRef.current = Date.now();
  }, [activeSlides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setProgressPercent(0);
    progressStartRef.current = Date.now();
  }, [activeSlides.length]);

  // Teclas direcionais
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Efeito de Autoplay
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (!isPlaying || activeSlides.length === 0) return;

    progressStartRef.current = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - progressStartRef.current;
      const pct = Math.min((elapsed / transitionSpeed) * 100, 100);
      setProgressPercent(pct);

      if (elapsed >= transitionSpeed) {
        handleNext();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, currentIndex, activeSlides.length, transitionSpeed, handleNext]);

  if (activeSlides.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#140205]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="cultura-container w-full h-full relative overflow-hidden bg-radial-burgundy text-[#F0F2F8] select-none flex flex-col font-sans">
      {/* Estilos CSS Injetados para Efeitos Premium */}
      <style dangerouslySetInnerHTML={{ __html: `
        .bg-radial-burgundy {
          background: radial-gradient(circle at center, #7C0A19 0%, #30030A 60%, #150104 100%);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .glass-card:hover {
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 8px 32px 0 rgba(239, 68, 68, 0.08);
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }
        .progress-bar-segment {
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar-fill {
          background: #E30613;
          height: 100%;
          border-radius: 2px;
          transition: width 80ms linear;
          box-shadow: 0 0 8px #FF4D5A;
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes float-slow {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float-slow 6s ease-in-out infinite;
        }
        .slide-enter {
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .map-pin-pulse {
          animation: pinPulse 2s infinite;
        }
        @keyframes pinPulse {
          0% { r: 6; opacity: 1; }
          100% { r: 18; opacity: 0; }
        }
        /* Scrollbar Stylings */
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.35);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.6);
        }
      ` }} />

      {/* 🔮 Grafismos Vetoriais Animados no Fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.2">
          {/* Círculos concêntricos pulsantes */}
          <circle cx="500" cy="500" r="150" className="animate-pulse" style={{ animationDuration: "12s" }} />
          <circle cx="500" cy="500" r="300" className="animate-pulse" style={{ animationDuration: "16s" }} />
          <circle cx="500" cy="500" r="450" className="animate-pulse" style={{ animationDuration: "20s" }} />
          {/* Linhas cruzadas */}
          <line x1="0" y1="500" x2="1000" y2="500" strokeDasharray="6 6" />
          <line x1="500" y1="0" x2="500" y2="1000" strokeDasharray="6 6" />
          {/* Orbitas angulares */}
          <polygon points="500,200 800,500 500,800 200,500" strokeWidth="0.5" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* 🚀 Header com Barras de Progresso Estilo Story */}
      <div className="w-full p-6 pb-2 relative z-10 flex flex-col gap-4">
        {/* Barras de Progresso */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${activeSlides.length}, minmax(0, 1fr))` }}>
          {activeSlides.map((s, idx) => (
            <div key={s.id} className="progress-bar-segment cursor-pointer" onClick={() => {
              setCurrentIndex(idx);
              setProgressPercent(0);
              progressStartRef.current = Date.now();
            }}>
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progressPercent}%` : "0%" 
                }}
              />
            </div>
          ))}
        </div>

        {/* Marca e Unidade */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <img src={logoBranca} alt="Lopes Logo" className="h-7 object-contain brightness-100" />
            <div className="h-5 w-[1px] bg-white/20"></div>
            <span className="text-sm font-semibold tracking-wider text-red-400 bg-red-950/40 border border-red-900/60 px-3 py-1 rounded-full uppercase">
              CULTURA LOPES
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-medium">Visualizando contexto:</span>
            <select
              value={previewUnitId}
              onChange={(e) => setPreviewUnitId(e.target.value)}
              className="bg-black/40 border border-white/10 text-white text-xs px-3 py-1 rounded-lg focus:outline-none focus:border-red-500 font-semibold cursor-pointer"
            >
              <option value="Todas">Unidade Geral</option>
              {unidades.map(u => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
            <div className="bg-white/10 text-white/80 text-xs px-3 py-1 rounded-lg font-bold">
              {currentIndex + 1} / {activeSlides.length}
            </div>
          </div>
        </div>
      </div>

      {/* 📺 Área Central de Renderização do Slide */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-8 py-4 flex items-center justify-center relative z-10">
        <div className="w-full h-full flex items-center justify-center slide-enter" key={currentSlide.id}>
          
          {/* 🌟 TEMPLATE 1: COVER (Capa do Slide) */}
          {currentSlide.template === "cover" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-5xl py-4">
              <div className="lg:col-span-7 text-left flex flex-col gap-6">
                {currentSlide.year && (
                  <div className="self-start bg-red-600/10 border border-red-500/30 text-red-400 font-extrabold text-sm tracking-[0.2em] px-5 py-1.5 rounded-full uppercase shadow-lg">
                    ONBOARDING {currentSlide.year}
                  </div>
                )}
                <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white uppercase text-glow leading-none font-mono">
                  {replaceVariables(currentSlide.title)}
                </h1>
                <div className="w-24 h-1.5 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
                {currentSlide.subtitle && (
                  <p className="text-lg lg:text-2xl text-white/80 font-medium tracking-wide">
                    {replaceVariables(currentSlide.subtitle)}
                  </p>
                )}
                {currentSlide.unitLabel && (
                  <div className="self-start mt-4 bg-gradient-to-r from-[#9E0018] to-[#60000E] border border-red-500/20 px-6 py-2.5 rounded-xl shadow-2xl">
                    <span className="text-xs font-black tracking-[0.3em] text-white">
                      {replaceVariables(currentSlide.unitLabel)}
                    </span>
                  </div>
                )}
              </div>
              <div className="lg:col-span-5 hidden lg:flex justify-center">
                <div className="w-80 h-[380px] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl relative">
                  <img 
                    src={currentSlide.image_url || "/cultura/FOTOS/LOJA AP.jpg"} 
                    alt="Lopes Loja" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-left">
                    <p className="text-[10px] font-black text-red-400 tracking-widest uppercase">Unidade Oficial</p>
                    <p className="text-sm font-bold text-white mt-1">Lopes {unitName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🤝 TEMPLATE 2: WELCOME (Mensagem dos Diretores / Onboarding) */}
          {currentSlide.template === "welcome" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
              {/* Coluna Texto */}
              <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                <span className="text-red-400 font-black text-sm tracking-[0.25em] uppercase">
                  {replaceVariables(currentSlide.subtitle)}
                </span>
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight whitespace-pre-line tracking-tight">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded-full"></div>
                <p className="text-base lg:text-lg text-white/70 leading-relaxed font-light whitespace-pre-line">
                  {replaceVariables(currentSlide.body)}
                </p>
              </div>
              {/* Coluna Imagem Representativa */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative p-3 rounded-3xl bg-black/40 border border-white/10 shadow-2xl overflow-hidden">
                  <div className="w-80 h-80 rounded-2xl overflow-hidden border-4 border-[#E30613]/85 relative">
                    <img 
                      src={currentSlide.image_url} 
                      alt="Lopes Apresentação" 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  {/* Badge Flutuante */}
                  <div className="absolute bottom-6 right-6 bg-gradient-to-r from-red-600 to-red-800 text-white text-xs font-black px-4 py-2 rounded-xl border border-red-500/20 shadow-xl uppercase tracking-wider">
                    {unitName} Liderança
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📋 TEMPLATE 3: BULLETS (Lista de itens / tópicos) */}
          {currentSlide.template === "bullets" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-6xl text-left">
              <div className={currentSlide.image_url ? "lg:col-span-7" : "lg:col-span-12"}>
                <div className="flex flex-col gap-2 mb-6">
                  <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                    {replaceVariables(currentSlide.subtitle)}
                  </span>
                  <h2 className="text-3xl lg:text-4xl font-extrabold text-white uppercase tracking-tight whitespace-pre-line">
                    {replaceVariables(currentSlide.title)}
                  </h2>
                  <div className="w-16 h-1 bg-red-500 rounded"></div>
                </div>

                <div className={`grid gap-6 ${currentSlide.image_url ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                  {currentSlide.bullets?.map((item, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-500/30">
                          <span className="text-red-400 font-black text-sm">{idx + 1}</span>
                        </div>
                        <h3 className="text-base font-bold text-white leading-snug">
                          {replaceVariables(item.title)}
                        </h3>
                      </div>
                      
                      <ul className="flex flex-col gap-2 pl-2">
                        {item.subtexts?.map((sub, sIdx) => (
                          <li key={sIdx} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                            <span className="text-red-500 mt-1.5">•</span>
                            <span>{replaceVariables(sub)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {currentSlide.image_url && (
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-sm h-96 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
                    <img 
                      src={currentSlide.image_url} 
                      alt="Cultura Lopes" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🗂️ TEMPLATE 4: GRID (Cartões de Pilares MVV, Gmail, Google Calendar, Marketing) */}
          {(currentSlide.template === "grid" || currentSlide.template === "tools" || currentSlide.template === "marketing") && (
            <div className="flex flex-col gap-8 w-full max-w-5xl text-center items-center">
              <div className="flex flex-col gap-2 items-center">
                {currentSlide.subtitle && (
                  <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                    {replaceVariables(currentSlide.subtitle)}
                  </span>
                )}
                <h2 className="text-4xl font-black text-white tracking-tight uppercase">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-4">
                {currentSlide.cards?.map((card, idx) => {
                  const isPrimary = card.variant === "primary";
                  const isAccent = card.variant === "accent";
                  
                  return (
                    <div 
                      key={idx} 
                      className={`glass-card p-8 rounded-3xl flex flex-col gap-5 text-left relative overflow-hidden transition-all duration-300 transform hover:-translate-y-2`}
                    >
                      {/* Brilho Superior */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                        isPrimary ? "from-blue-500 to-indigo-600" : isAccent ? "from-red-600 to-red-400" : "from-[#00c6ff] to-[#0072ff]"
                      }`} />

                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black tracking-widest px-3 py-1 rounded-full uppercase ${
                          isPrimary ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : isAccent ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-[#00c6ff]/10 text-[#00c6ff] border border-[#00c6ff]/20"
                        }`}>
                          {card.title}
                        </span>
                      </div>

                      <p className="text-sm text-white/80 leading-relaxed font-light font-sans whitespace-pre-line">
                        {replaceVariables(card.content)}
                      </p>

                      {card.bullets && card.bullets.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-white/5">
                          {card.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2 text-xs font-medium text-white/90">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                              <span>{replaceVariables(b)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 📊 TEMPLATE 5: SPLIT-METRICS (Overview com Métricas Gigantes, Meritocracia) */}
          {(currentSlide.template === "split-metrics" || currentSlide.template === "meritocracia") && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full text-left">
              {/* Coluna Dados de Texto */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-none whitespace-pre-line">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded"></div>
                <p className="text-base text-white/70 leading-relaxed font-light whitespace-pre-line">
                  {replaceVariables(currentSlide.body)}
                </p>
                {currentSlide.image_url && (
                  <div className="w-full h-44 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative mt-2">
                    <img 
                      src={currentSlide.image_url} 
                      alt="Lopes Overview" 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent"></div>
                  </div>
                )}
              </div>
              
              {/* Coluna Contadores Gigantes */}
              <div className="lg:col-span-6 flex flex-col gap-6 font-sans">
                {currentSlide.metrics?.map((m, idx) => (
                  <div 
                    key={idx} 
                    className="glass-card p-6 rounded-2xl flex items-center justify-between gap-6 border-l-[4px] border-l-red-500 hover:border-l-red-400 transition-all duration-300"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-white/50 font-bold uppercase tracking-wider">
                        Indicador {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-white/95 mt-1 leading-tight">
                        {replaceVariables(m.label)}
                      </span>
                    </div>
                    <div className="text-3xl lg:text-5xl font-black text-red-500 tracking-tight font-mono text-glow shrink-0">
                      {replaceVariables(m.value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 👥 TEMPLATE 6: TEAM-GRID (Corpo Administrativo) */}
          {currentSlide.template === "team-grid" && (
            <div className="flex flex-col gap-6 w-full max-w-6xl text-center items-center">
              <div className="flex flex-col gap-2 items-center">
                {currentSlide.subtitle && (
                  <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                    {replaceVariables(currentSlide.subtitle)}
                  </span>
                )}
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full mt-4 justify-center">
                {currentSlide.teamMembers?.map((member, idx) => (
                  <div key={idx} className="glass-card p-4 rounded-2xl flex flex-col items-center gap-3 transition-transform duration-300 transform hover:-translate-y-1">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-red-500/40 shadow-lg relative">
                      <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-sm font-bold text-white leading-tight">{member.name}</span>
                      <span className="text-[10px] text-white/50 font-semibold uppercase mt-0.5 tracking-wider">{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📅 TEMPLATE 7: TIMELINE (Linha do Tempo de Eventos) */}
          {currentSlide.template === "timeline" && (
            <div className="flex flex-col gap-6 w-full max-w-5xl text-center items-center">
              <div className="flex flex-col gap-2 items-center">
                {currentSlide.subtitle && (
                  <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                    {replaceVariables(currentSlide.subtitle)}
                  </span>
                )}
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded-full"></div>
              </div>

              {/* Scrollable timeline list */}
              <div className="flex gap-4 w-full overflow-x-auto py-4 px-2 mt-4 justify-start lg:justify-center scrollbar-thin">
                {currentSlide.timelineItems?.map((item, idx) => (
                  <div key={idx} className="glass-card p-5 rounded-2xl flex flex-col gap-3 min-w-[280px] max-w-[320px] text-left relative overflow-hidden flex-shrink-0 transition-transform duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-400" />
                    
                    <span className="text-xs font-black text-red-400 uppercase tracking-widest">
                      Etapa {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1 leading-snug">
                      {replaceVariables(item.title)}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed font-light mt-1">
                      {replaceVariables(item.description)}
                    </p>

                    {item.image_url && (
                      <div className="w-full h-24 rounded-lg overflow-hidden border border-white/5 mt-2">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📢 TEMPLATE 8: CAMPAIGN (Campanhas Mobi 0km e Indique e Ganhe) */}
          {currentSlide.template === "campaign" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-6xl text-left">
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  {currentSlide.subtitle && (
                    <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                      {replaceVariables(currentSlide.subtitle)}
                    </span>
                  )}
                  <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight uppercase leading-none">
                    {replaceVariables(currentSlide.title)}
                  </h2>
                  <div className="w-16 h-1 bg-red-500 rounded"></div>
                </div>

                <p className="text-sm lg:text-base text-white/85 leading-relaxed font-light whitespace-pre-line">
                  {replaceVariables(currentSlide.body)}
                </p>

                <div className="flex flex-col gap-4 mt-2">
                  {currentSlide.bullets?.map((bullet, idx) => (
                    <div key={idx} className="glass-card p-5 rounded-2xl border-l-4 border-l-red-500">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                        {replaceVariables(bullet.title)}
                      </h3>
                      <ul className="flex flex-col gap-1.5">
                        {bullet.subtexts?.map((sub, sIdx) => (
                          <li key={sIdx} className="text-xs text-white/75 flex items-start gap-2 leading-relaxed font-light">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{replaceVariables(sub)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {currentSlide.image_url && (
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                    <img 
                      src={currentSlide.image_url} 
                      alt={currentSlide.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🌀 TEMPLATE 9: SPIN (Metodologia SPIN Selling) */}
          {currentSlide.template === "spin" && (
            <div className="flex flex-col gap-6 w-full max-w-5xl text-center items-center font-sans">
              <div className="flex flex-col gap-2 items-center">
                {currentSlide.subtitle && (
                  <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                    {replaceVariables(currentSlide.subtitle)}
                  </span>
                )}
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase font-sans">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded-full"></div>
              </div>

              {currentSlide.body && (
                <p className="text-sm lg:text-base text-white/80 max-w-3xl leading-relaxed italic font-light">
                  "{replaceVariables(currentSlide.body)}"
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4">
                {currentSlide.spinData?.map((item, idx) => (
                  <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-2xl flex items-center justify-center shadow-lg border border-red-400/20">
                      {item.letter}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-white/60 leading-normal font-light">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📈 TEMPLATE 10: CAREER (Plano de Carreira do Corretor) */}
          {currentSlide.template === "career" && (
            <div className="flex flex-col gap-6 w-full max-w-5xl text-center items-center">
              <div className="flex flex-col gap-2 items-center">
                {currentSlide.subtitle && (
                  <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                    {replaceVariables(currentSlide.subtitle)}
                  </span>
                )}
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded-full"></div>
              </div>

              {currentSlide.body && (
                <p className="text-sm lg:text-base text-white/80 max-w-3xl leading-relaxed font-light">
                  {replaceVariables(currentSlide.body)}
                </p>
              )}

              <div className="flex flex-col gap-3 w-full max-w-3xl mt-4 font-sans">
                {currentSlide.careerTiers?.map((tier, idx) => {
                  const colorClass = idx === 0 
                    ? "from-red-600 to-red-700 border-red-500" 
                    : idx === 1
                    ? "from-red-700/85 to-red-800/85 border-red-600/30"
                    : "from-white/5 to-white/5 border-white/5";
                  
                  return (
                    <div key={idx} className={`glass-card p-4 rounded-xl flex flex-col sm:flex-row items-center sm:justify-between gap-4 border text-left bg-gradient-to-r ${colorClass} transition-transform duration-300 hover:translate-x-1`}>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black px-2.5 py-1 rounded-lg bg-black/40 text-white min-w-[32px] text-center">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-white leading-tight">{tier.name}</span>
                          <span className="text-xs text-white/60 leading-tight mt-0.5 font-light">{tier.rule}</span>
                        </div>
                      </div>
                      <div className="text-xl font-black text-white bg-black/30 px-4 py-1.5 rounded-lg border border-white/10 shrink-0 font-mono text-glow">
                        {tier.percentage}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🎁 TEMPLATE 11: BENEFITS (Clube de Benefícios) */}
          {currentSlide.template === "benefits" && (
            <div className="flex flex-col gap-6 w-full max-w-5xl text-center items-center">
              <div className="flex flex-col gap-2 items-center">
                {currentSlide.subtitle && (
                  <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                    {replaceVariables(currentSlide.subtitle)}
                  </span>
                )}
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded-full"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mt-4 justify-center items-center">
                {currentSlide.images?.map((url, idx) => (
                  <div key={idx} className="glass-card p-4 rounded-2xl flex items-center justify-center aspect-[3/2] overflow-hidden transition-all duration-300 transform hover:scale-105 hover:bg-white/10">
                    <img src={url} alt={`Parceiro ${idx + 1}`} className="max-w-full max-h-full object-contain filter brightness-95 hover:brightness-100 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 👗 TEMPLATE 12: DRESS-CODE (Vestimenta e Aparência Masculina & Feminina) */}
          {currentSlide.template === "dress-code" && (
            <div className="flex flex-col gap-6 w-full max-w-5xl text-center items-center">
              <div className="flex flex-col gap-2 items-center">
                {currentSlide.subtitle && (
                  <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                    {replaceVariables(currentSlide.subtitle)}
                  </span>
                )}
                <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded-full"></div>
              </div>

              {currentSlide.body && (
                <p className="text-xs lg:text-sm text-white/70 max-w-3xl leading-relaxed font-light">
                  {replaceVariables(currentSlide.body)}
                </p>
              )}

              <div className="flex gap-4 w-full overflow-x-auto py-4 px-2 mt-4 justify-start lg:justify-center scrollbar-thin">
                {currentSlide.images?.map((url, idx) => (
                  <div key={idx} className="w-44 h-64 rounded-2xl overflow-hidden border border-white/10 shadow-xl relative flex-shrink-0 transition-transform duration-300 hover:scale-105">
                    <img src={url} alt={`Estilo ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      <span className="text-[10px] font-black text-white/90 bg-red-600/80 px-2 py-0.5 rounded uppercase tracking-wider">
                        Referência {idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🗺️ TEMPLATE 13: MAP (Mapa da Força Lopes no Brasil) */}
          {currentSlide.template === "map" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
              {/* Texto Esquerda */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-left">
                <span className="text-red-400 font-black text-xs tracking-[0.3em] uppercase">
                  {replaceVariables(currentSlide.subtitle)}
                </span>
                <h2 className="text-4xl font-black text-white tracking-tight uppercase leading-none">
                  {replaceVariables(currentSlide.title)}
                </h2>
                <div className="w-16 h-1 bg-red-500 rounded"></div>
                <p className="text-sm text-white/70 leading-relaxed font-light">
                  {replaceVariables(currentSlide.body)}
                </p>

                {/* Métricas do Mapa */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-wider block">PRESENÇA</span>
                    <span className="text-xl font-bold text-red-400 block mt-1">{currentSlide.mapData?.regionCount}</span>
                  </div>
                  <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Foco Regional</span>
                    <span className="text-xs font-bold text-white block mt-2 leading-tight">{currentSlide.mapData?.centerHighlight}</span>
                  </div>
                </div>
              </div>

              {/* Mapa de Vetores SVG Direto (Aparência Excelente e Interativa) */}
              <div className="lg:col-span-7 flex justify-center relative">
                <div className="w-full max-w-lg aspect-square bg-black/20 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex items-center justify-center shadow-inner">
                  {/* SVG Mapa do Brasil Estilizado (Abstrato Premium) */}
                  <svg className="w-full h-full max-h-[350px] opacity-75" viewBox="0 0 500 500" fill="none">
                    {/* Linhas de Grade de Longitude/Latitude Globais */}
                    <path d="M 50 100 Q 250 150 450 100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <path d="M 50 250 Q 250 300 450 250" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <path d="M 50 400 Q 250 450 450 400" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <path d="M 100 50 Q 150 250 100 450" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <path d="M 250 50 Q 300 250 250 450" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <path d="M 400 50 Q 450 250 400 450" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                    {/* Silhueta Abstrata Premium do Brasil */}
                    <path 
                      d="M 180,100 C 220,90 320,60 380,110 C 440,150 460,200 410,250 C 370,290 380,330 350,370 C 320,410 270,440 240,450 C 210,460 190,410 180,380 C 170,350 150,330 130,310 C 100,280 80,240 90,200 C 100,160 140,110 180,100 Z" 
                      fill="rgba(227,6,19,0.04)" 
                      stroke="rgba(227,6,19,0.25)" 
                      strokeWidth="2.5" 
                      strokeDasharray="4 2" 
                    />
                    
                    {/* Linhas de conexão entre hubs */}
                    <path d="M 250 270 L 360 170" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeDasharray="3 3" />
                    <path d="M 250 270 L 340 310" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeDasharray="3 3" />
                    <path d="M 250 270 L 220 200" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeDasharray="3 3" />

                    {/* Pins Pulsantes Brilhantes das Unidades */}
                    {/* Centro (Goiânia/Brasília - Foco Central) */}
                    <g transform="translate(250, 270)">
                      <circle cx="0" cy="0" r="12" fill="#E30613" className="map-pin-pulse" />
                      <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
                    </g>
                    {/* São Paulo (Hub Histórico) */}
                    <g transform="translate(340, 310)">
                      <circle cx="0" cy="0" r="10" fill="#E30613" className="map-pin-pulse" style={{ animationDelay: "0.5s" }} />
                      <circle cx="0" cy="0" r="4.5" fill="#FF4D5A" />
                    </g>
                    {/* Rio de Janeiro */}
                    <g transform="translate(365, 290)">
                      <circle cx="0" cy="0" r="8" fill="#E30613" className="map-pin-pulse" style={{ animationDelay: "1s" }} />
                      <circle cx="0" cy="0" r="4" fill="#FF4D5A" />
                    </g>
                    {/* Nordeste (Recife/Salvador) */}
                    <g transform="translate(380, 150)">
                      <circle cx="0" cy="0" r="8" fill="#E30613" className="map-pin-pulse" style={{ animationDelay: "0.8s" }} />
                      <circle cx="0" cy="0" r="4" fill="#FF4D5A" />
                    </g>
                    {/* Norte (Manaus/Belém) */}
                    <g transform="translate(190, 160)">
                      <circle cx="0" cy="0" r="8" fill="#E30613" className="map-pin-pulse" style={{ animationDelay: "1.2s" }} />
                      <circle cx="0" cy="0" r="4" fill="#FF4D5A" />
                    </g>
                    {/* Sul (Porto Alegre) */}
                    <g transform="translate(280, 390)">
                      <circle cx="0" cy="0" r="8" fill="#E30613" className="map-pin-pulse" style={{ animationDelay: "1.5s" }} />
                      <circle cx="0" cy="0" r="4" fill="#FF4D5A" />
                    </g>
                  </svg>

                  {/* Informação Flutuante no Mapa */}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-black text-white/90">
                    HUB GOIÂNIA: ATIVO (LOPES {unitName.toUpperCase()})
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 🎮 CONTROLES INFERIORES: Painel Flutuante Glassmorphism */}
      <div className="w-full p-6 relative z-10 flex justify-center pointer-events-none">
        <div className="glass-card rounded-2xl px-6 py-3 flex items-center justify-between gap-6 pointer-events-auto max-w-2xl w-full">
          
          {/* Botões de Ação */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrev}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 transition-colors border border-white/5"
              title="Voltar (Seta Esquerda)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all transform hover:scale-105 shadow-md shadow-red-950/40 border border-red-500/20"
              title={isPlaying ? "Pausar Apresentação (Barra de Espaço)" : "Iniciar Apresentação (Barra de Espaço)"}
            >
              {isPlaying ? (
                <Icons.Pause size={14} color="#FFF" />
              ) : (
                <Icons.Play size={14} color="#FFF" />
              )}
            </button>

            <button 
              onClick={handleNext}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 transition-colors border border-white/5"
              title="Avançar (Seta Direita)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Indicador de Status do Autoplay */}
          <div className="hidden sm:flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isPlaying ? "bg-green-500 animate-pulse" : "bg-white/30"}`}></span>
            <span className="text-[10px] font-black text-white/45 tracking-widest uppercase">
              {isPlaying ? `AUTOPLAY ATIVO (${transitionSpeed / 1000}s)` : "REPRODUÇÃO PAUSADA"}
            </span>
          </div>

          {/* Velocidade de Rotação */}
          <div className="flex items-center gap-1 bg-black/30 border border-white/5 p-1 rounded-xl">
            {[5000, 8000, 12000].map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  setTransitionSpeed(speed);
                  setProgressPercent(0);
                  progressStartRef.current = Date.now();
                }}
                className={`text-[10px] font-black tracking-wider px-2.5 py-1 rounded-lg uppercase transition-all ${
                  transitionSpeed === speed 
                    ? "bg-red-600 text-white shadow-md border border-red-500/20" 
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {speed / 1000}s
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
