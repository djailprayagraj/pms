// Safe Transliteration with Offline/CORS Fallback
export const transliterateToHindi = async (text) => {
  if (!text || typeof text !== 'string') return '';
  if (!/[a-zA-Z]/.test(text) || /[\u0900-\u097F]/.test(text)) return text;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=hi-t-i0-und&num=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]?.[0]) {
      return data[1][0][1][0];
    }
  } catch (error) {
    console.warn(`[Transliteration Notice] API blocked or offline for: "${text}".`, error);
  }

  return text;
};

export const cleanPurePersonName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return '';
  return rawName
    .replace(/\([^)]*\)/g, '')
    .replace(/[@#\/]/g, ' ')
    .replace(/\b(ut|fir)\b/gi, '')
    .replace(/[0-9]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || rawName;
};

export const smartTransliterateMixedString = async (rawText) => {
  if (!rawText || typeof rawText !== 'string' || rawText.trim() === '' || rawText.toUpperCase() === 'NA') {
    return 'N/A';
  }
  const pureName = cleanPurePersonName(rawText);
  const translatedName = await transliterateToHindi(pureName);
  return translatedName.trim() || 'N/A';
};

export const isFemaleInmate = (record) => {
  if (!record) return false;
  if (record.gender?.toUpperCase() === 'FEMALE' || record.sex?.toUpperCase() === 'FEMALE') return true;

  const name = (record.prisonerName || '').toLowerCase();
  const barrack = (record.barrack || '').toLowerCase();

  if (barrack.includes('female') || barrack.includes('mahila') || barrack.includes('women')) return true;

  const femaleKeywords = ['devi', 'kumari', 'w/o', 'wife of', 'd/o', 'daughter of', 'sita', 'geeta', 'sunita', 'anita', 'pooja', 'rekha', 'radha', 'usha', 'asha'];
  return femaleKeywords.some(keyword => name.includes(keyword));
};

export const filterRecordsByMode = (recordsList, filterMode) => {
  if (!Array.isArray(recordsList)) return [];
  return recordsList.filter((record) => {
    const mode = (record.appearanceMode || '').toUpperCase();
    const option = (record.sub_option || '').toUpperCase();
    const isVC = mode === 'VC' || option === 'VC';
    const isSession = mode === 'SESSION_ADALAT' || mode === 'ADALAT';

    if (filterMode === 'SESSION') return isSession && !isVC;
    if (filterMode === 'VC') return isVC;
    return true;
  });
};

export const deduplicateRecordsByUT = (recordsList) => {
  if (!Array.isArray(recordsList)) return [];
  const seenUTs = new Set();
  const uniqueList = [];

  for (const record of recordsList) {
    const utKey = (record.utNumber || '').trim().toUpperCase();
    if (utKey && !seenUTs.has(utKey)) {
      seenUTs.add(utKey);
      uniqueList.push(record);
    } else if (!utKey) {
      uniqueList.push(record);
    }
  }
  return uniqueList;
};

export const sortRecordsWithFemalesLast = (recordsList) => {
  if (!Array.isArray(recordsList)) return [];
  const males = [];
  const females = [];

  recordsList.forEach((record) => {
    if (isFemaleInmate(record)) females.push(record);
    else males.push(record);
  });
  return [...males, ...females];
};

export const calculateTotalWarrants = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const val = Number(item.warrantCount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
};