-- 1. Adiciona as colunas novas na tabela de imoveis (se não existirem)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'price') THEN
        ALTER TABLE public.imoveis ADD COLUMN price TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'area') THEN
        ALTER TABLE public.imoveis ADD COLUMN area TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'rooms') THEN
        ALTER TABLE public.imoveis ADD COLUMN rooms TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'imoveis' AND column_name = 'garage') THEN
        ALTER TABLE public.imoveis ADD COLUMN garage TEXT;
    END IF;
END $$;

-- 2. Atualiza o valor realizado (vendeu) para o mês de Agosto
DO $$
BEGIN
    UPDATE public.config_metas 
    SET meta_mensal_realizado = 33155698.92 
    WHERE meta_mensal_periodo = 'AGOSTO DE 2026';
END $$;
