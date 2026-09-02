-- Script para criar a tabela pastas_cultura (Espelho do Cultura Base44)

CREATE TABLE IF NOT EXISTS public.pastas_cultura (
    id_origem TEXT PRIMARY KEY,
    lancamento TEXT,
    corretor TEXT,
    gestor TEXT,
    status_escolha TEXT,
    data_pasta DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ativar RLS
ALTER TABLE public.pastas_cultura ENABLE ROW LEVEL SECURITY;

-- Política de leitura (opcional, para visualização no painel)
CREATE POLICY "Permitir leitura pública ou admin para pastas" 
ON public.pastas_cultura FOR SELECT 
USING (true);
