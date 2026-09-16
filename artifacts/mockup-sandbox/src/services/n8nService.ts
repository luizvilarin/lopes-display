export interface PessoaSemFotoAlerta {
  id: string;
  nome: string;
  cargo: "corretor" | "gestor";
  unidade_id?: string;
  posicao?: number;
  tipo_ranking?: string;
  valor_vgv?: number;
}

export const n8nService = {
  getWebhookUrl: (): string => {
    return localStorage.getItem("lopes_n8n_webhook_url") || "";
  },

  setWebhookUrl: (url: string): void => {
    localStorage.setItem("lopes_n8n_webhook_url", url.trim());
  },

  formatWhatsAppMessage: (pessoas: PessoaSemFotoAlerta[]): string => {
    const dataHora = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    
    let msg = `🚨 *Lopes Display — Alerta de Fotos Pendentes* 📸\n`;
    msg += `_Verificação automática em ${dataHora}_\n\n`;
    msg += `Identificamos *${pessoas.length} pessoas* no ranking que ainda estão *sem foto* na TV:\n\n`;

    const corretores = pessoas.filter(p => p.cargo === "corretor");
    const gestores = pessoas.filter(p => p.cargo === "gestor");

    if (corretores.length > 0) {
      msg += `🏅 *CORRETORES:*\n`;
      corretores.forEach((p, idx) => {
        const posText = p.posicao ? `[${p.posicao}º Lugar]` : "";
        msg += `• ${posText} *${p.nome}*\n`;
      });
      msg += `\n`;
    }

    if (gestores.length > 0) {
      msg += `👔 *GESTORES:*\n`;
      gestores.forEach((p, idx) => {
        const posText = p.posicao ? `[${p.posicao}º Lugar]` : "";
        msg += `• ${posText} *${p.nome}*\n`;
      });
      msg += `\n`;
    }

    msg += `👉 *Adicione as fotos no painel:* https://lopes-display.vercel.app/admin`;
    return msg;
  },

  sendPhotoAlert: async (pessoas: PessoaSemFotoAlerta[], overrideUrl?: string): Promise<{ success: boolean; message: string }> => {
    const url = overrideUrl || n8nService.getWebhookUrl();
    if (!url) {
      return { success: false, message: "URL do Webhook do n8n não configurada." };
    }

    if (pessoas.length === 0) {
      return { success: true, message: "Nenhuma pessoa sem foto encontrada." };
    }

    const mensagem_whatsapp = n8nService.formatWhatsAppMessage(pessoas);

    const payload = {
      event: "alerta_pessoas_sem_foto",
      origem: "Lopes Digital Display",
      timestamp: new Date().toISOString(),
      total_sem_foto: pessoas.length,
      pessoas,
      mensagem_whatsapp
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`n8n retornou status ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: `Alerta disparado com sucesso para o n8n! (${pessoas.length} pessoas notificadas)`
      };
    } catch (err: any) {
      console.error("Erro ao enviar alerta para o n8n:", err);
      return {
        success: false,
        message: `Falha ao conectar com n8n: ${err?.message || "Erro de rede"}`
      };
    }
  },

  testWebhook: async (url: string): Promise<{ success: boolean; message: string }> => {
    if (!url || !url.trim()) {
      return { success: false, message: "Informe uma URL válida do n8n." };
    }

    const testPayload = {
      event: "teste_conexao",
      origem: "Lopes Digital Display",
      timestamp: new Date().toISOString(),
      mensagem_whatsapp: "✅ *Lopes Display* — Teste de conexão com n8n realizado com sucesso!"
    };

    try {
      const response = await fetch(url.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return { success: true, message: "Webhook do n8n respondeu com sucesso! Conexão validada." };
    } catch (err: any) {
      return { success: false, message: `Erro ao testar webhook: ${err?.message || "Erro de conexão"}` };
    }
  }
};
