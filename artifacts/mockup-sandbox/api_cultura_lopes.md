# API Reference

**Base URL:** `https://culturalopes.base44.app/api`

## Setup

```bash
npm install @base44/sdk
```

```javascript
import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "69c6968d69275d31a18c7815",
  headers: {
    "api_key": "0f46b3a315864bfea3f7077ebec66320"
  }
});
```

(Documentação completa fornecida pelo usuário no chat)
Endpoints principais mapeados:
- HistoricoAVG (Desempenho de gestores)
- FilaPasta (Ranking de Pastas / Lançamentos / Vendas)
- MetaVendas (Valores de meta)
- Corretor (Lista de corretores ativos)
- Empreendimento / Lancamento (Produtos)
- EspelhoUnidade (Unidades vendidas)
- Funções Backend: readSheetsVendas, etc.
