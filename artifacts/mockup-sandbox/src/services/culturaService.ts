export interface CulturaCorretor {
  id: string;
  nome_completo: string;
  cargo: string;
  loja: string;
  status_ativo: string;
  foto_url?: string;
  // ... other fields
}

const API_URL = "https://culturalopes.base44.app/api";
const API_KEY = "0f46b3a315864bfea3f7077ebec66320";

async function fetchCultura<T>(endpoint: string): Promise<T[]> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "api_key": API_KEY,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Cultura Lopes API Error: ${response.statusText}`);
  }

  return response.json();
}

export interface CulturaFilaPasta {
  id: string;
  lancamento: string;
  gestor: string;
  corretor: string;
  pasta_anexada: boolean;
  status_escolha: string;
  created_date: string;
}

export interface CulturaEspelhoUnidade {
  id: string;
  fila_pasta_id: string;
  cliente: string;
  lancamento: string;
  numero: string;
  valor: number;
  corretor: string;
  gestor: string;
  lopes_unidade: string;
  status: string;
  created_date: string;
}

export interface CulturaConfigDashboardVendas {
  id: string;
  spreadsheetId: string;
  sheetName: string;
  colVGV: string;
  colGestor: string;
  colCorretor: string;
  colEmpreendimento: string;
  colIncorporadora: string;
  colData: string;
  colUnidade: string;
  colDia: string;
  colMes: string;
  colAno: string;
  created_date: string;
}

export const culturaService = {
  getCorretores: async (): Promise<CulturaCorretor[]> => {
    return fetchCultura<CulturaCorretor>("/entities/Corretor?limit=1000");
  },
  
  getGestores: async (): Promise<CulturaCorretor[]> => {
    return fetchCultura<CulturaCorretor>("/entities/User?q={\"role\":\"gestor\"}&limit=1000");
  },

  getFilaPastas: async (): Promise<CulturaFilaPasta[]> => {
    return fetchCultura<CulturaFilaPasta>("/entities/FilaPasta?limit=2000");
  },

  getEspelhosUnidade: async (): Promise<CulturaEspelhoUnidade[]> => {
    return fetchCultura<CulturaEspelhoUnidade>("/entities/EspelhoUnidade?limit=5000");
  },

  getConfigDashboardVendas: async (): Promise<CulturaConfigDashboardVendas[]> => {
    return fetchCultura<CulturaConfigDashboardVendas>("/entities/ConfigDashboardVendas?limit=1");
  }
};
