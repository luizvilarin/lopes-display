import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function
export default async function handler(req: any, res: any) {
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  // 1. Validar a Autenticação (Bearer Token)
  const authHeader = req.headers.authorization;
  const SECRET_KEY = process.env.API_SECRET_KEY; // Chave configurada no painel da Vercel

  if (!SECRET_KEY) {
    console.error("ERRO: API_SECRET_KEY não configurada na Vercel.");
    return res.status(500).json({ error: 'Configuração do servidor ausente.' });
  }

  if (!authHeader || authHeader !== `Bearer ${SECRET_KEY}`) {
    return res.status(401).json({ error: 'Não autorizado. Token inválido.' });
  }

  try {
    // 2. Extrair o Payload (os dados que o Cultura/Sistema externo enviou)
    const payload = req.body;
    
    console.log("Recebendo payload do Webhook:", JSON.stringify(payload));

    if (!payload) {
      return res.status(400).json({ error: 'Corpo da requisição vazio.' });
    }

    // 3. Conectar ao Supabase utilizando a chave de Administrador (Service Role Key)
    // Isso garante que a API tem poder de escrita total no banco, burlando RLS.
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("ERRO: Credenciais do Supabase não configuradas no ambiente (Service Role Key).");
      return res.status(500).json({ error: 'Configuração do banco de dados ausente.' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // =====================================================================
    // 4. LÓGICA DE PROCESSAMENTO (Exemplo genérico até o usuário definir)
    // =====================================================================
    
    /* 
    Exemplo do que faremos aqui:
    const { tipo, dadosVendas } = payload;
    
    // Processar dados...
    // Inserir no Supabase:
    // await supabase.from('ranking_entries').insert(dadosVendas);
    */

    // Retorna sucesso para quem enviou
    return res.status(200).json({
      success: true,
      message: 'Webhook recebido com sucesso!',
      receivedPayloadType: typeof payload,
      // data: payload
    });

  } catch (error: any) {
    console.error("Erro interno no Webhook:", error);
    return res.status(500).json({ error: 'Erro interno no servidor.', detail: error.message });
  }
}
