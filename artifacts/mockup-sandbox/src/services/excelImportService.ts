import * as XLSX from "xlsx";
import type { Pessoa, Cargo, RankingEntry } from "../types/placar";

// ─── String Normalization & Fuzzy Matching Utils ─────────────────────────────

/**
 * Remove acentos, pontuação e espaços extras, convertendo para CAIXA ALTA.
 */
export function normalizeName(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")     // Mantém apenas letras e números
    .replace(/\s+/g, " ")            // Remove espaços duplicados
    .trim();
}

/**
 * Calcula a distância de Levenshtein entre duas strings.
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  for (let i = 0; i <= lenA; i++) matrix[i] = [i];
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[lenA][lenB];
}

/**
 * Retorna uma pontuação de similaridade entre 0.0 e 1.0 entre dois nomes.
 * Considera igualdade exata, subconjuntos de palavras (tokens) e Levenshtein.
 */
export function calculateNameSimilarity(rawNameA: string, rawNameB: string): number {
  const normA = normalizeName(rawNameA);
  const normB = normalizeName(rawNameB);

  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;

  const tokensA = normA.split(" ");
  const tokensB = normB.split(" ");

  // Checa se todos os tokens do nome mais curto estão contidos no nome mais longo (ex: "ISABELA FRANCO" vs "ISABELA FRANCO SILVA")
  const [shorterTokens, longerTokens] = tokensA.length <= tokensB.length 
    ? [tokensA, tokensB] 
    : [tokensB, tokensA];

  const allTokensMatched = shorterTokens.every(st => 
    longerTokens.some(lt => lt === st || (st.length >= 3 && lt.startsWith(st)))
  );

  if (allTokensMatched) {
    const ratio = shorterTokens.length / longerTokens.length;
    return Math.min(0.98, 0.85 + ratio * 0.13);
  }

  // Fallback para Levenshtein Distance
  const maxLen = Math.max(normA.length, normB.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(normA, normB);
  const similarity = 1.0 - dist / maxLen;

  return Math.max(0, similarity);
}

/**
 * Mapeia a coluna LOJA da planilha para a unidade_id do sistema.
 */
export function mapLojaToUnidadeId(lojaText?: string): string {
  const norm = normalizeName(lojaText || "");
  if (norm.includes("BUENO")) return "bueno";
  if (norm.includes("GOIAS") || norm.includes("JARDIM")) return "jd-goias";
  if (norm.includes("MARISTA")) return "marista";
  if (norm.includes("OESTE")) return "oeste";
  return "jd-goias"; // Unidade padrão fallback
}

/**
 * Nomes genéricos que devem ser desconsiderados nos rankings.
 */
function isIgnoredName(name: string): boolean {
  const norm = normalizeName(name);
  if (!norm) return true;
  
  const ignored = [
    "SOCIOS", "SOCIO", "SOCIAS", "SOCIA", "GERENTES",
    // Sócios
    "SERENO LEAO", "RAFAEL BADRA", "DEYVID RHUSSEL", "JANN COSTA", 
    "LUZIANO", "JOSE SOARES", "MURILO FEITOSA"
  ];
  
  return ignored.some(ignoredName => norm.includes(ignoredName));
}

// ─── Interfaces de Saída do Processamento da Planilha ─────────────────────────

export interface ParsedPersonRanking {
  nameInExcel: string;
  normalizedName: string;
  totalValor: number;
  totalVendas: number;
  matchedPessoa?: Pessoa;
  similarityScore: number;
  isNewPerson: boolean;
  suggestedUnidadeId: string;
  suggestedCargo: Cargo;
}

export interface ParsedMonthData {
  periodo: string; // Ex: "MAIO DE 2026"
  monthNumber: number;
  yearNumber: number;
  totalVolume: number;
  totalTransactions: number;
  topCorretores: ParsedPersonRanking[];
  topGestores: ParsedPersonRanking[];
}

export interface SpreadsheetParseResult {
  fileName: string;
  totalRowsProcessed: number;
  validSalesCount: number;
  availableMonths: string[]; // Lista de meses encontrados ex: ["MAIO DE 2026", "ABRIL DE 2026"]
  monthsData: Record<string, ParsedMonthData>;
}

// ─── Core Parser Function ───────────────────────────────────────────────────

const MONTH_NAMES = [
  "JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO",
  "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"
];

/**
 * Processa o Buffer/ArrayBuffer de um arquivo .xlsx e extrai os dados das vendas,
 * correlacionando os nomes dos corretores e gestores com as Pessoas do cadastro.
 */
export function parseSalesSpreadsheet(
  fileBuffer: ArrayBuffer | Uint8Array,
  fileName: string,
  pessoasCadastradas: Pessoa[]
): SpreadsheetParseResult {
  const workbook = XLSX.read(fileBuffer, { type: "array", dense: true });
  const sheetName = workbook.SheetNames.includes("GERAL") 
    ? "GERAL" 
    : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
  if (rows.length === 0) {
    throw new Error("A planilha enviada está vazia.");
  }

  // Identifica índices das colunas
  const headers = rows[0].map(h => String(h || "").trim());
  const idxDate = headers.indexOf("DATA DA VENDA");
  const idxValor = headers.indexOf("VALOR DA VENDA");
  const idxCorretor = headers.indexOf("CORRETOR");
  const idxGestor = headers.findIndex(h => h.startsWith("GESTOR"));
  const idxLoja = headers.indexOf("LOJA");
  const idxStatus = headers.indexOf("STATUS");

  if (idxValor === -1 || idxCorretor === -1) {
    throw new Error("Cabeçalho da planilha inválido. As colunas 'VALOR DA VENDA' e 'CORRETOR' são obrigatórias.");
  }

  let validSalesCount = 0;

  // Agrupadores por Período -> Pessoa -> Totais
  const rawMonthsData: Record<string, {
    monthNumber: number;
    yearNumber: number;
    corretoresMap: Record<string, { rawName: string; totalValor: number; totalVendas: number; loja: string }>;
    gestoresMap: Record<string, { rawName: string; totalValor: number; totalVendas: number; loja: string }>;
    totalVolume: number;
    totalTransactions: number;
  }> = {};

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const rawDate = row[idxDate];
    const corretorName = String(row[idxCorretor] || "").trim();
    const gestorName = idxGestor !== -1 ? String(row[idxGestor] || "").trim() : "";
    const valor = Number(row[idxValor]) || 0;
    const lojaStr = idxLoja !== -1 ? String(row[idxLoja] || "").trim() : "";
    const statusStr = idxStatus !== -1 ? String(row[idxStatus] || "").trim() : "";

    // Filtra apenas vendas com valor válido
    if (valor <= 0 || (!corretorName && !gestorName)) continue;
    if (statusStr.toUpperCase().includes("CANCELAD")) continue; // Ignora canceladas se houver

    // Extrai Mês/Ano da Data da Venda
    let mNum = 5;
    let yNum = 2026;

    if (typeof rawDate === "number") {
      const dObj = XLSX.SSF.parse_date_code(rawDate);
      if (dObj) {
        mNum = dObj.m;
        yNum = dObj.y;
      }
    } else if (typeof rawDate === "string") {
      const parsedDate = new Date(rawDate);
      if (!isNaN(parsedDate.getTime())) {
        mNum = parsedDate.getMonth() + 1;
        yNum = parsedDate.getFullYear();
      }
    }

    const monthName = MONTH_NAMES[mNum - 1] || "MAIO";
    const periodoKey = `${monthName} DE ${yNum}`;

    if (!rawMonthsData[periodoKey]) {
      rawMonthsData[periodoKey] = {
        monthNumber: mNum,
        yearNumber: yNum,
        corretoresMap: {},
        gestoresMap: {},
        totalVolume: 0,
        totalTransactions: 0
      };
    }

    const monthRecord = rawMonthsData[periodoKey];
    monthRecord.totalVolume += valor;
    monthRecord.totalTransactions += 1;
    validSalesCount++;

    // Agrupa Corretor (Ignora SÓCIOS e GERENTES)
    if (corretorName && !isIgnoredName(corretorName)) {
      const normC = normalizeName(corretorName);
      if (!monthRecord.corretoresMap[normC]) {
        monthRecord.corretoresMap[normC] = { rawName: corretorName, totalValor: 0, totalVendas: 0, loja: lojaStr };
      }
      monthRecord.corretoresMap[normC].totalValor += valor;
      monthRecord.corretoresMap[normC].totalVendas += 1;
    }

    // Agrupa Gestor (Ignora SÓCIOS e GERENTES)
    if (gestorName && !isIgnoredName(gestorName)) {
      const normG = normalizeName(gestorName);
      if (!monthRecord.gestoresMap[normG]) {
        monthRecord.gestoresMap[normG] = { rawName: gestorName, totalValor: 0, totalVendas: 0, loja: lojaStr };
      }
      monthRecord.gestoresMap[normG].totalValor += valor;
      monthRecord.gestoresMap[normG].totalVendas += 1;
    }
  }

  // Converte e realiza o Fuzzy Matching para cada mês
  const processedMonths: Record<string, ParsedMonthData> = {};
  const availableMonths = Object.keys(rawMonthsData);

  availableMonths.forEach(periodoKey => {
    const rawData = rawMonthsData[periodoKey];

    // Processa Corretores
    const corretoresList: ParsedPersonRanking[] = Object.values(rawData.corretoresMap).map(item => {
      const match = matchPersonToDatabase(item.rawName, "corretor", item.loja, pessoasCadastradas);
      return {
        nameInExcel: item.rawName,
        normalizedName: normalizeName(item.rawName),
        totalValor: item.totalValor,
        totalVendas: item.totalVendas,
        matchedPessoa: match.bestMatch,
        similarityScore: match.score,
        isNewPerson: !match.bestMatch || match.score < 0.75,
        suggestedUnidadeId: match.bestMatch?.unidade_id || mapLojaToUnidadeId(item.loja),
        suggestedCargo: "corretor"
      };
    });

    // Processa Gestores
    const gestoresList: ParsedPersonRanking[] = Object.values(rawData.gestoresMap).map(item => {
      const match = matchPersonToDatabase(item.rawName, "gestor", item.loja, pessoasCadastradas);
      return {
        nameInExcel: item.rawName,
        normalizedName: normalizeName(item.rawName),
        totalValor: item.totalValor,
        totalVendas: item.totalVendas,
        matchedPessoa: match.bestMatch,
        similarityScore: match.score,
        isNewPerson: !match.bestMatch || match.score < 0.75,
        suggestedUnidadeId: match.bestMatch?.unidade_id || mapLojaToUnidadeId(item.loja),
        suggestedCargo: "gestor"
      };
    });

    // Ordena por maior valor de vendas e pega Top 10 e Top 5
    corretoresList.sort((a, b) => b.totalValor - a.totalValor);
    gestoresList.sort((a, b) => b.totalValor - a.totalValor);

    processedMonths[periodoKey] = {
      periodo: periodoKey,
      monthNumber: rawData.monthNumber,
      yearNumber: rawData.yearNumber,
      totalVolume: rawData.totalVolume,
      totalTransactions: rawData.totalTransactions,
      topCorretores: corretoresList.slice(0, 10),
      topGestores: gestoresList.slice(0, 5)
    };
  });

  return {
    fileName,
    totalRowsProcessed: rows.length,
    validSalesCount,
    availableMonths,
    monthsData: processedMonths
  };
}

/**
 * Busca a melhor correspondência para um nome na lista de Pessoas do sistema.
 * Leva em conta o cargo e a Unidade (LOJA) como fator de pontuação extra.
 */
function matchPersonToDatabase(
  excelName: string,
  cargoTarget: Cargo,
  lojaText: string,
  pessoasCadastradas: Pessoa[]
): { bestMatch?: Pessoa; score: number } {
  let bestMatch: Pessoa | undefined = undefined;
  let maxScore = 0;

  const targetUnidadeId = mapLojaToUnidadeId(lojaText);

  // Filtra pessoas preferencialmente do mesmo cargo
  const candidates = pessoasCadastradas.filter(p => p.cargo === cargoTarget);
  // Se não encontrar nenhuma do mesmo cargo, tenta na lista geral
  const pool = candidates.length > 0 ? candidates : pessoasCadastradas;

  pool.forEach(p => {
    let score = calculateNameSimilarity(excelName, p.nome);

    // Se a pessoa pertencer à MESMA unidade que consta na coluna LOJA da planilha,
    // ganha um bônus de similaridade de +0.15 para reforçar o acerto (ex: Bueno com Bueno)
    if (p.unidade_id === targetUnidadeId && score >= 0.55) {
      score = Math.min(1.0, score + 0.15);
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = p;
    }
  });

  return { bestMatch, score: maxScore };
}
