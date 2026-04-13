/**
 * Google Apps Script (GAS) Backend for Dashboard Pelaporan Waran
 * 
 * Cara Penggunaan:
 * 1. Buka Google Sheets anda.
 * 2. Pergi ke Extensions > Apps Script.
 * 3. Salin dan tampal kod ini ke dalam fail Code.gs.
 * 4. Pastikan nama sheet anda adalah "DataProgram".
 * 5. Klik 'Deploy' > 'New Deployment' > 'Web App'.
 * 6. Set 'Execute as' kepada 'Me' dan 'Who has access' kepada 'Anyone'.
 */

const SHEET_NAME = "DataProgram";

/**
 * Mengambil data dari Google Sheet
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "Sheet bernama '" + SHEET_NAME + "' tidak dijumpai. Sila pastikan nama tab di Google Sheets anda adalah tepat." 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map((row, index) => {
      let obj = { id: (index + 1).toString() };
      headers.forEach((header, i) => {
        const key = mapHeaderToKey(header);
        obj[key] = row[i];
      });
      
      return calculateDerived(obj);
    });
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Mengemaskini data ke Google Sheet
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const id = postData.id;
    const update = postData.update;
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const rowIndex = parseInt(id); // ID is row index + 1
    
    if (rowIndex > 0 && rowIndex < data.length) {
      // Update specific columns based on the update object
      for (let key in update) {
        const headerName = mapKeyToHeader(key);
        const colIndex = headers.indexOf(headerName);
        if (colIndex !== -1) {
          sheet.getRange(rowIndex + 1, colIndex + 1).setValue(update[key]);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "ID not found" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Mapping Header Sheet ke Key JSON
 */
function mapHeaderToKey(header) {
  const mapping = {
    "NEGERI": "negeri",
    "NAMA PROGRAM": "namaProgram",
    "TARIKH MULA BENGKEL": "tarikhMula",
    "TARIKH TAMAT BENGKEL": "tarikhTamat",
    "LOKASI BENGKEL": "lokasi",
    "BILANGAN PESERTA": "bilanganPeserta",
    "IMPAK/ OUTPUT/ HASIL PROGRAM": "impak",
    "CADANGAN PENAMBAHBAIKAN": "cadangan",
    "PAUTAN GAMBAR": "pautanGambar",
    "OS21000": "os21000",
    "OS24000": "os24000",
    "OS29000": "os29000",
    "OS42000": "os42000",
    "JUMLAH WARAN GUNA 0S21000": "gunaOs21000",
    "JUMLAH WARAN GUNA 0S24000": "gunaOs24000",
    "JUMLAH WARAN GUNA 0S29000": "gunaOs29000",
    "JUMLAH WARAN GUNA 0S42000": "gunaOs42000"
  };
  return mapping[header] || header;
}

/**
 * Mapping Key JSON ke Header Sheet
 */
function mapKeyToHeader(key) {
  const mapping = {
    "negeri": "NEGERI",
    "namaProgram": "NAMA PROGRAM",
    "tarikhMula": "TARIKH MULA BENGKEL",
    "tarikhTamat": "TARIKH TAMAT BENGKEL",
    "lokasi": "LOKASI BENGKEL",
    "bilanganPeserta": "BILANGAN PESERTA",
    "impak": "IMPAK/ OUTPUT/ HASIL PROGRAM",
    "cadangan": "CADANGAN PENAMBAHBAIKAN",
    "pautanGambar": "PAUTAN GAMBAR",
    "os21000": "OS21000",
    "os24000": "OS24000",
    "os29000": "OS29000",
    "os42000": "OS42000",
    "gunaOs21000": "JUMLAH WARAN GUNA 0S21000",
    "gunaOs24000": "JUMLAH WARAN GUNA 0S24000",
    "gunaOs29000": "JUMLAH WARAN GUNA 0S29000",
    "gunaOs42000": "JUMLAH WARAN GUNA 0S42000"
  };
  return mapping[key] || key;
}

/**
 * Pengiraan Baki dan Peratusan
 */
function calculateDerived(p) {
  const os21 = parseFloat(p.os21000) || 0;
  const os24 = parseFloat(p.os24000) || 0;
  const os29 = parseFloat(p.os29000) || 0;
  const os42 = parseFloat(p.os42000) || 0;
  
  const guna21 = parseFloat(p.gunaOs21000) || 0;
  const guna24 = parseFloat(p.gunaOs24000) || 0;
  const guna29 = parseFloat(p.gunaOs29000) || 0;
  const guna42 = parseFloat(p.gunaOs42000) || 0;

  const jumlahWaranTerima = os21 + os24 + os29 + os42;
  const bakiOs21000 = os21 - guna21;
  const bakiOs24000 = os24 - guna24;
  const bakiOs29000 = os29 - guna29;
  const bakiOs42000 = os42 - guna42;
  const bakiKeseluruhan = bakiOs21000 + bakiOs24000 + bakiOs29000 + bakiOs42000;
  const peratusBaki = jumlahWaranTerima > 0 ? (bakiKeseluruhan / jumlahWaranTerima) * 100 : 0;

  return {
    ...p,
    jumlahWaranTerima,
    bakiOs21000,
    bakiOs24000,
    bakiOs29000,
    bakiOs42000,
    bakiKeseluruhan,
    peratusBaki
  };
}
