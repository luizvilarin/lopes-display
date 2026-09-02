-- Script para criar a tabela vendas_cultura

CREATE TABLE IF NOT EXISTS public.vendas_cultura (
    id_origem TEXT PRIMARY KEY,
    corretor TEXT,
    gestor TEXT,
    vgv NUMERIC,
    data_venda DATE,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ativar RLS
ALTER TABLE public.vendas_cultura ENABLE ROW LEVEL SECURITY;

-- Como a API será acessada usando o Service Role Key, ela pode dar bypass no RLS.
-- O front-end não precisa ler essa tabela diretamente, pois a API atualizará os rankings.
-- Opcional: Se quisermos permitir que o painel admin apenas visualize:
CREATE POLICY "Permitir leitura pública ou admin para vendas" 
ON public.vendas_cultura FOR SELECT 
USING (true);
