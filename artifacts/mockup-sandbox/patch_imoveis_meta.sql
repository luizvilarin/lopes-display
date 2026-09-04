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

-- 2. Atualiza o valor da meta global para o mês de Agosto (33.155.698,92)
-- Se não houver configuração, insere. Se houver, atualiza a primeira.
DO $$
DECLARE
    meta_id BIGINT;
BEGIN
    SELECT id INTO meta_id FROM public.config_metas ORDER BY id ASC LIMIT 1;
    IF meta_id IS NOT NULL THEN
        UPDATE public.config_metas SET meta_vgv = 33155698.92 WHERE id = meta_id;
    ELSE
        INSERT INTO public.config_metas (meta_vgv) VALUES (33155698.92);
    END IF;
END $$;
