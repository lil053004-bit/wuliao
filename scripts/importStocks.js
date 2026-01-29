import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../server/data/database.db');
const db = new Database(dbPath);

async function importStocks() {
  try {
    console.log('Reading stock.json...');
    const stockJsonPath = join(__dirname, '../public/assets/stock.json');
    let fileContent = readFileSync(stockJsonPath, 'utf-8').trim();

    if (!fileContent.startsWith('[')) {
      fileContent = '[' + fileContent;
    }
    if (!fileContent.endsWith(']')) {
      if (fileContent.endsWith(',')) {
        fileContent = fileContent.slice(0, -1) + ']';
      } else {
        fileContent = fileContent + ']';
      }
    }

    const stocksData = JSON.parse(fileContent);

    if (!Array.isArray(stocksData)) {
      console.error('stock.json is not an array');
      process.exit(1);
    }

    console.log(`Found ${stocksData.length} stocks in JSON file`);

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO stocks (id, code, name, market, industry)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((stocks) => {
      for (const stock of stocks) {
        insertStmt.run(stock.id, stock.code, stock.name, stock.market, stock.industry);
      }
    });

    const validStocks = stocksData
      .filter(stock => stock.name && /^\d+[A-Z]?$/.test(stock.name))
      .map(stock => ({
        id: randomUUID(),
        code: stock.name,
        name: stock.description || '',
        market: stock.exchange || 'TSE',
        industry: ''
      }));

    skipped = stocksData.length - validStocks.length;

    try {
      insertMany(validStocks);
      imported = validStocks.length;
      console.log(`Imported ${imported} stocks`);
    } catch (error) {
      console.error('Error inserting stocks:', error.message);
      errors = validStocks.length;
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total stocks in file: ${stocksData.length}`);
    console.log(`Successfully imported: ${imported}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);

    const count = db.prepare('SELECT COUNT(*) as count FROM stocks').get().count;
    console.log(`Total stocks in database: ${count}`);

    db.close();
  } catch (error) {
    console.error('Error importing stocks:', error);
    db.close();
    process.exit(1);
  }
}

importStocks();
