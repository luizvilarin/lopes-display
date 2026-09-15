-- Limpeza de rankings de teste e preparação para Setembro de 2026

-- 1. Limpa entradas antigas/teste de rankings mensais
DELETE FROM public.ranking_entries WHERE tipo = 'mensal';

-- 2. Limpa rankings de pastas antigos de teste
DELETE FROM public.ranking_pastas;

-- 3. Atualiza configuração de metas para Setembro de 2026
DO $$
DECLARE
    v_id BIGINT;
BEGIN
    SELECT id INTO v_id FROM public.config_metas ORDER BY id ASC LIMIT 1;
    IF v_id IS NOT NULL THEN
        UPDATE public.config_metas 
        SET 
            meta_mensal_titulo = 'Meta Mensal - SETEMBRO DE 2026',
            meta_mensal_periodo = 'SETEMBRO DE 2026',
            meta_mensal_valor = 60000000,
            meta_mensal_realizado = 0,
            forcar_exibir_ranking = false
        WHERE id = v_id;
    ELSE
        INSERT INTO public.config_metas (
            meta_mensal_titulo, 
            meta_mensal_periodo, 
            meta_mensal_valor, 
            meta_mensal_realizado, 
            unidade_id, 
            forcar_exibir_ranking
        ) VALUES (
            'Meta Mensal - SETEMBRO DE 2026',
            'SETEMBRO DE 2026',
            60000000,
            0,
            'marista',
            false
        );
    END IF;
END $$;
