const fs = require('fs');
const path = require('path');

// Credenciais do Supabase obtidas do arquivo .env
const SUPABASE_URL = 'https://caztotyxnrdpplmbumqi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhenRvdHl4bnJkcHBsbWJ1bXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIwNTIsImV4cCI6MjA5NDQzODA1Mn0.LVwvc9n9ZJfns6v9pVnmvSNkJ_hOp_bx3FCJxBB4K6Q';

const BASE_PATH = 'c:\\Users\\luzin\\Downloads\\BANCO\\FOTOS TIME LOPES';

const UNIDADES_MAP = {
  'BUENO': 'bueno',
  'JARDIM GOIAS': 'jd-goias',
  'MARISTA': 'marista',
  'OESTE': 'oeste'
};

function formatName(filename) {
  // Remove extensão
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  // Remove hífens e substitui por espaços
  let normalized = nameWithoutExt.replace(/[-_]/g, ' ');
  // Capitaliza cada palavra
  normalized = normalized.split(' ')
    .filter(w => w.length > 0)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return normalized;
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

function imageToBase64(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const mime = getMimeType(filePath);
  const data = fs.readFileSync(filePath);
  return `data:${mime};base64,${data.toString('base64')}`;
}

async function request(url, options = {}) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro na requisição a ${url}: ${response.status} ${text}`);
  }

  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return text;
  }
}

async function run() {
  console.log('--- INICIANDO IMPORTAÇÃO DE FOTOS DA EQUIPE ---');
  console.log('Lendo diretório base:', BASE_PATH);

  if (!fs.existsSync(BASE_PATH)) {
    console.error('ERRO: Diretório base não existe!');
    return;
  }

  // 1. Carregar pessoas atuais do Supabase para evitar duplicações
  console.log('Carregando pessoas existentes no Supabase...');
  let pessoasExistentes = [];
  try {
    pessoasExistentes = await request(`${SUPABASE_URL}/rest/v1/pessoas?select=*`);
    console.log(`Encontradas ${pessoasExistentes.length} pessoas no banco.`);
  } catch (e) {
    console.error('Erro ao listar pessoas:', e.message);
    return;
  }

  const subdirs = fs.readdirSync(BASE_PATH);

  for (const subdir of subdirs) {
    const fullSubdirPath = path.join(BASE_PATH, subdir);
    if (!fs.statSync(fullSubdirPath).isDirectory()) continue;

    const unidadeId = UNIDADES_MAP[subdir.toUpperCase()];
    if (!unidadeId) {
      console.log(`Subpasta ignorada (não mapeada como unidade): ${subdir}`);
      continue;
    }

    console.log(`\nProcessando Unidade: ${subdir} (${unidadeId})`);

    const cargosDirs = ['CORRETORES', 'GESTORES'];
    for (const cargoDir of cargosDirs) {
      const fullCargoPath = path.join(fullSubdirPath, cargoDir);
      if (!fs.existsSync(fullCargoPath) || !fs.statSync(fullCargoPath).isDirectory()) {
        continue;
      }

      const cargo = cargoDir === 'GESTORES' ? 'gestor' : 'corretor';
      console.log(`  Processando pasta: ${cargoDir} (${cargo})`);

      const files = fs.readdirSync(fullCargoPath);
      for (const file of files) {
        const filePath = path.join(fullCargoPath, file);
        if (fs.statSync(filePath).isDirectory()) continue;

        // Apenas imagens
        const ext = path.extname(filePath).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
          continue;
        }

        const nome = formatName(file);
        console.log(`    Membro encontrado: "${nome}"`);

        // Converter foto para Base64
        let base64 = null;
        try {
          // Otimização: Se o arquivo for muito grande, avise
          const stats = fs.statSync(filePath);
          const sizeMB = stats.size / (1024 * 1024);
          if (sizeMB > 5) {
            console.log(`      Aviso: Imagem grande (${sizeMB.toFixed(2)} MB), processando...`);
          }
          base64 = imageToBase64(filePath);
        } catch (e) {
          console.error(`      Erro ao ler imagem: ${e.message}`);
          continue;
        }

        // Verificar se já existe uma pessoa com o mesmo nome na mesma unidade
        const existente = pessoasExistentes.find(
          p => p.nome.toLowerCase().trim() === nome.toLowerCase().trim() && p.unidade_id === unidadeId
        );

        try {
          if (existente) {
            console.log(`      Membro já cadastrado (ID: ${existente.id}). Atualizando foto e dados...`);
            await request(`${SUPABASE_URL}/rest/v1/pessoas?id=eq.${existente.id}`, {
              method: 'PATCH',
              body: JSON.stringify({
                foto_url: base64,
                cargo: cargo,
                ativo: true
              })
            });
            console.log('      Atualizado com sucesso.');
          } else {
            console.log('      Novo membro. Cadastrando...');
            await request(`${SUPABASE_URL}/rest/v1/pessoas`, {
              method: 'POST',
              body: JSON.stringify({
                nome: nome,
                cargo: cargo,
                unidade_id: unidadeId,
                foto_url: base64,
                ativo: true
              }),
              headers: {
                'Prefer': 'return=representation'
              }
            });
            console.log('      Cadastrado com sucesso.');
          }
        } catch (e) {
          console.error(`      Erro ao salvar membro no Supabase: ${e.message}`);
        }
      }
    }
  }

  console.log('\n--- IMPORTAÇÃO FINALIZADA ---');
}

run().catch(console.error);
