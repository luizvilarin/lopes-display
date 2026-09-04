DO $$
DECLARE
    v_periodo TEXT := 'AGOSTO DE 2026';
    p_id UUID;
BEGIN
    DELETE FROM public.ranking_entries WHERE periodo = v_periodo AND tipo = 'mensal';

    -- LUDMILA
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Ludmila%' AND cargo = 'gestor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Ludmila', 'gestor', '/fotos/agosto/gestores/LUDMILA.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/gestores/LUDMILA.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'gestores', 1, 8126740.21, v_periodo, true);

    -- RUTEMBERG
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Rutemberg%' AND cargo = 'gestor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Rutemberg', 'gestor', '/fotos/agosto/gestores/RUTEMBERG.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/gestores/RUTEMBERG.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'gestores', 2, 3064900.00, v_periodo, true);

    -- CLAUDIA
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Claudia%' AND cargo = 'gestor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Claudia', 'gestor', '/fotos/agosto/gestores/CLAUDIA.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/gestores/CLAUDIA.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'gestores', 3, 2350000.00, v_periodo, true);

    -- ANDERSON SAMPA
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Anderson Sampa%' AND cargo = 'gestor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Anderson Sampa', 'gestor', '/fotos/agosto/gestores/ANDERSON_SAMPA.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/gestores/ANDERSON_SAMPA.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'gestores', 4, 2277697.00, v_periodo, true);

    -- EURICO
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Eurico%' AND cargo = 'gestor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Eurico', 'gestor', '/fotos/agosto/gestores/EURICO.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/gestores/EURICO.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'gestores', 5, 2163528.08, v_periodo, true);

    -- ANNA PAULA
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Anna Paula%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Anna Paula', 'corretor', '/fotos/agosto/corretores/ANNA_PAULA.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/ANNA_PAULA.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 1, 7190440.21, v_periodo, true);

    -- LYEGHE
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Lyeghe%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Lyeghe', 'corretor', '/fotos/agosto/corretores/LYEGHE.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/LYEGHE.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 2, 2350000.00, v_periodo, true);

    -- TADEU
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Tadeu%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Tadeu', 'corretor', '/fotos/agosto/corretores/TADEU.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/TADEU.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 3, 2155000.00, v_periodo, true);

    -- BRUNA
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Bruna%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Bruna', 'corretor', '/fotos/agosto/corretores/BRUNA.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/BRUNA.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 4, 2120000.00, v_periodo, true);

    -- ANDRE
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Andre%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Andre', 'corretor', '/fotos/agosto/corretores/ANDRE.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/ANDRE.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 5, 1685000.00, v_periodo, true);

    -- CLAUDIO
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Claudio%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Claudio', 'corretor', '/fotos/agosto/corretores/CLAUDIO.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/CLAUDIO.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 6, 1529951.28, v_periodo, true);

    -- JAIRO
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Jairo%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Jairo', 'corretor', '/fotos/agosto/corretores/JAIRO.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/JAIRO.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 7, 1261621.67, v_periodo, true);

    -- LETICIA
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Leticia%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Leticia', 'corretor', '/fotos/agosto/corretores/LETICIA.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/LETICIA.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 8, 1245280.00, v_periodo, true);

    -- ANA CLARA
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Ana Clara%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Ana Clara', 'corretor', '/fotos/agosto/corretores/ANA_CLARA.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/ANA_CLARA.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 9, 1066100.00, v_periodo, true);

    -- BRUNNO
    SELECT id INTO p_id FROM public.pessoas WHERE nome ILIKE 'Brunno%' AND cargo = 'corretor' LIMIT 1;
    IF p_id IS NULL THEN
        p_id := gen_random_uuid();
        INSERT INTO public.pessoas (id, nome, cargo, foto_url, ativo) VALUES (p_id, 'Brunno', 'corretor', '/fotos/agosto/corretores/BRUNNO.png', true);
    ELSE
        UPDATE public.pessoas SET foto_url = '/fotos/agosto/corretores/BRUNNO.png' WHERE id = p_id;
    END IF;
    INSERT INTO public.ranking_entries (pessoa_id, tipo, categoria, posicao, valor, periodo, ativo)
    VALUES (p_id, 'mensal', 'corretores', 10, 973000.00, v_periodo, true);

END $$;
