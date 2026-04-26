import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  }
});

function initialize() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS production_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_code TEXT UNIQUE NOT NULL,
        model TEXT NOT NULL,
        model_code TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        production_date TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS barcodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        batch_code TEXT NOT NULL,
        model TEXT NOT NULL,
        model_code TEXT NOT NULL,
        production_date TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        FOREIGN KEY (batch_code) REFERENCES production_batches(batch_code)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS printed_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_code TEXT UNIQUE NOT NULL,
        printed_at TEXT NOT NULL,
        FOREIGN KEY (batch_code) REFERENCES production_batches(batch_code)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS sequence_tracker (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracker_key TEXT UNIQUE NOT NULL,
        last_sequence INTEGER NOT NULL DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS batch_sequence_tracker (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracker_key TEXT UNIQUE NOT NULL,
        last_batch_sequence INTEGER NOT NULL DEFAULT 0
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS delivery_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode_code TEXT NOT NULL,
        model TEXT NOT NULL,
        delivery_date TEXT NOT NULL,
        delivery_time TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (barcode_code) REFERENCES barcodes(code)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS receiving_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode_code TEXT NOT NULL,
        model TEXT NOT NULL,
        receive_date TEXT NOT NULL,
        receive_time TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (barcode_code) REFERENCES barcodes(code)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS usage_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode_code TEXT NOT NULL,
        model TEXT NOT NULL,
        use_date TEXT NOT NULL,
        use_time TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (barcode_code) REFERENCES barcodes(code)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS barcode_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        barcode_code TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'production',
        delivery_date TEXT,
        delivery_time TEXT,
        receive_date TEXT,
        receive_time TEXT,
        use_date TEXT,
        use_time TEXT,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (barcode_code) REFERENCES barcodes(code)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS barcode_fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS barcode_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_key TEXT UNIQUE NOT NULL,
        config_value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    console.log('Database initialized successfully');
  });
}

function getSequenceTracker(callback) {
  db.all('SELECT tracker_key, last_sequence FROM sequence_tracker', [], (err, rows) => {
    if (err) {
      console.error('Error getting sequence tracker:', err.message);
      callback({});
      return;
    }
    const tracker = {};
    rows.forEach(row => {
      tracker[row.tracker_key] = row.last_sequence;
    });
    callback(tracker);
  });
}

function updateSequenceTracker(trackerKey, lastSequence, callback) {
  db.run(
    'INSERT OR REPLACE INTO sequence_tracker (tracker_key, last_sequence) VALUES (?, ?)',
    [trackerKey, lastSequence],
    function(err) {
      if (err) {
        console.error('Error updating sequence tracker:', err.message);
      }
      if (callback) callback();
    }
  );
}

function getBatchSequenceTracker(callback) {
  db.all('SELECT tracker_key, last_batch_sequence FROM batch_sequence_tracker', [], (err, rows) => {
    if (err) {
      console.error('Error getting batch sequence tracker:', err.message);
      callback({});
      return;
    }
    const tracker = {};
    rows.forEach(row => {
      tracker[row.tracker_key] = row.last_batch_sequence;
    });
    callback(tracker);
  });
}

function updateBatchSequenceTracker(trackerKey, lastBatchSequence, callback) {
  db.run(
    'INSERT OR REPLACE INTO batch_sequence_tracker (tracker_key, last_batch_sequence) VALUES (?, ?)',
    [trackerKey, lastBatchSequence],
    function(err) {
      if (err) {
        console.error('Error updating batch sequence tracker:', err.message);
      }
      if (callback) callback();
    }
  );
}

function saveBatch(batch, barcodes, callback) {
  db.serialize(() => {
    db.run(
      'INSERT INTO production_batches (batch_code, model, model_code, quantity, production_date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [batch.batchCode, batch.model, batch.modelCode, batch.quantity, batch.productionDate, batch.createdAt],
      function(err) {
        if (err) {
          console.error('Error saving batch:', err.message);
          callback(err);
          return;
        }
      }
    );

    const stmt = db.prepare(
      'INSERT INTO barcodes (code, batch_code, model, model_code, production_date, sequence) VALUES (?, ?, ?, ?, ?, ?)'
    );

    barcodes.forEach(barcode => {
      stmt.run([barcode.code, barcode.batchCode, barcode.model, barcode.modelCode, barcode.productionDate, barcode.sequence], (err) => {
        if (err) {
          console.error('Error saving barcode:', err.message);
        }
      });
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error finalizing statement:', err.message);
        callback(err);
        return;
      }
      callback(null);
    });
  });
}

function getAllBatches(callback) {
  db.all('SELECT * FROM production_batches ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error getting batches:', err.message);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function getBarcodesByBatchCode(batchCode, callback) {
  db.all('SELECT * FROM barcodes WHERE batch_code = ? ORDER BY sequence', [batchCode], (err, rows) => {
    if (err) {
      console.error('Error getting barcodes:', err.message);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function getPrintedBatches(callback) {
  db.all('SELECT batch_code FROM printed_batches', [], (err, rows) => {
    if (err) {
      console.error('Error getting printed batches:', err.message);
      callback(new Set());
      return;
    }
    const printed = new Set(rows.map(row => row.batch_code));
    callback(printed);
  });
}

function markBatchAsPrinted(batchCode, callback) {
  db.run(
    'INSERT OR IGNORE INTO printed_batches (batch_code, printed_at) VALUES (?, ?)',
    [batchCode, new Date().toISOString()],
    function(err) {
      if (err) {
        console.error('Error marking batch as printed:', err.message);
      }
      if (callback) callback();
    }
  );
}

function getAllBarcodes(callback) {
  db.all(`
    SELECT b.*,
           bs.status as current_status,
           bs.delivery_date,
           bs.delivery_time,
           bs.receive_date,
           bs.receive_time,
           bs.use_date,
           bs.use_time
    FROM barcodes b
    LEFT JOIN barcode_status bs ON b.code = bs.barcode_code
    ORDER BY b.production_date DESC, b.sequence DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error getting all barcodes:', err.message);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function getBarcodeByCode(barcodeCode, callback) {
  db.get(`
    SELECT b.*,
           bs.status as current_status,
           bs.delivery_date,
           bs.delivery_time,
           bs.receive_date,
           bs.receive_time,
           bs.use_date,
           bs.use_time
    FROM barcodes b
    LEFT JOIN barcode_status bs ON b.code = bs.barcode_code
    WHERE b.code = ?
  `, [barcodeCode], (err, row) => {
    if (err) {
      console.error('Error getting barcode:', err.message);
      callback(null);
      return;
    }
    callback(row);
  });
}

function updateBarcodeStatus(barcodeCode, status, date, time, callback) {
  const now = new Date().toISOString();
  let columns, placeholders, params;

  if (status === 'delivery') {
    columns = 'barcode_code, status, delivery_date, delivery_time, updated_at';
    placeholders = '?, ?, ?, ?, ?';
    params = [barcodeCode, status, date, time, now];
  } else if (status === 'received') {
    columns = 'barcode_code, status, receive_date, receive_time, updated_at';
    placeholders = '?, ?, ?, ?, ?';
    params = [barcodeCode, status, date, time, now];
  } else if (status === 'used') {
    columns = 'barcode_code, status, use_date, use_time, updated_at';
    placeholders = '?, ?, ?, ?, ?';
    params = [barcodeCode, status, date, time, now];
  } else {
    columns = 'barcode_code, status, updated_at';
    placeholders = '?, ?, ?';
    params = [barcodeCode, status, now];
  }

  db.run(
    `INSERT INTO barcode_status (${columns}) VALUES (${placeholders}) ON CONFLICT(barcode_code) DO UPDATE SET status = ?, updated_at = ?${status === 'delivery' ? ', delivery_date = ?, delivery_time = ?' : status === 'received' ? ', receive_date = ?, receive_time = ?' : status === 'used' ? ', use_date = ?, use_time = ?' : ''}`,
    [...params, status, now, ...(status === 'delivery' || status === 'received' || status === 'used' ? [date, time] : [])],
    function(err) {
      if (err) {
        console.error('Error updating barcode status:', err.message);
      }
      if (callback) callback(err);
    }
  );
}

function saveDeliveryRecord(barcodeCode, model, deliveryDate, deliveryTime, callback) {
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO delivery_records (barcode_code, model, delivery_date, delivery_time, created_at) VALUES (?, ?, ?, ?, ?)',
    [barcodeCode, model, deliveryDate, deliveryTime, now],
    function(err) {
      if (err) {
        console.error('Error saving delivery record:', err.message);
      }
      if (callback) callback(err);
    }
  );
}

function getDeliveryRecords(callback) {
  db.all('SELECT * FROM delivery_records ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error getting delivery records:', err.message);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function saveReceivingRecord(barcodeCode, model, receiveDate, receiveTime, callback) {
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO receiving_records (barcode_code, model, receive_date, receive_time, created_at) VALUES (?, ?, ?, ?, ?)',
    [barcodeCode, model, receiveDate, receiveTime, now],
    function(err) {
      if (err) {
        console.error('Error saving receiving record:', err.message);
      }
      if (callback) callback(err);
    }
  );
}

function getReceivingRecords(callback) {
  db.all('SELECT * FROM receiving_records ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error getting receiving records:', err.message);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function saveUsageRecord(barcodeCode, model, useDate, useTime, callback) {
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO usage_records (barcode_code, model, use_date, use_time, created_at) VALUES (?, ?, ?, ?, ?)',
    [barcodeCode, model, useDate, useTime, now],
    function(err) {
      if (err) {
        console.error('Error saving usage record:', err.message);
      }
      if (callback) callback(err);
    }
  );
}

function getUsageRecords(callback) {
  db.all('SELECT * FROM usage_records ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error getting usage records:', err.message);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function getAllBarcodeFields(callback) {
  db.all('SELECT * FROM barcode_fields ORDER BY id', [], (err, rows) => {
    if (err) {
      console.error('Error getting barcode fields:', err.message);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function saveBarcodeField(name, type, callback) {
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO barcode_fields (name, type, created_at) VALUES (?, ?, ?)',
    [name, type, now],
    function(err) {
      if (err) {
        console.error('Error saving barcode field:', err.message);
      }
      if (callback) callback(err);
    }
  );
}

function deleteBarcodeField(id, callback) {
  db.run('DELETE FROM barcode_fields WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting barcode field:', err.message);
    }
    if (callback) callback(err);
  });
}

function getStatistics(callback) {
  db.get(`
    SELECT
      (SELECT COUNT(*) FROM barcodes) as total,
      (SELECT COUNT(*) FROM barcodes b LEFT JOIN barcode_status bs ON b.code = bs.barcode_code WHERE bs.status IS NULL OR bs.status = 'production') as production,
      (SELECT COUNT(*) FROM barcodes b LEFT JOIN barcode_status bs ON b.code = bs.barcode_code WHERE bs.status = 'delivery') as delivery,
      (SELECT COUNT(*) FROM barcodes b LEFT JOIN barcode_status bs ON b.code = bs.barcode_code WHERE bs.status = 'received') as received,
      (SELECT COUNT(*) FROM barcodes b LEFT JOIN barcode_status bs ON b.code = bs.barcode_code WHERE bs.status = 'used') as used
  `, [], (err, row) => {
    if (err) {
      console.error('Error getting statistics:', err.message);
      callback({ total: 0, production: 0, delivery: 0, received: 0, used: 0 });
      return;
    }
    callback(row || { total: 0, production: 0, delivery: 0, received: 0, used: 0 });
  });
}

function getModelStatistics(callback) {
  db.all(`
    SELECT
      b.model,
      COUNT(*) as total,
      SUM(CASE WHEN bs.status IS NULL OR bs.status = 'production' THEN 1 ELSE 0 END) as production,
      SUM(CASE WHEN bs.status = 'delivery' THEN 1 ELSE 0 END) as delivery,
      SUM(CASE WHEN bs.status = 'received' THEN 1 ELSE 0 END) as received,
      SUM(CASE WHEN bs.status = 'used' THEN 1 ELSE 0 END) as used
    FROM barcodes b
    LEFT JOIN barcode_status bs ON b.code = bs.barcode_code
    GROUP BY b.model
  `, [], (err, rows) => {
    if (err) {
      console.error('Error getting model statistics:', err.message);
      callback([]);
      return;
    }
    callback(rows);
  });
}

function getBarcodeConfig(callback) {
  db.all('SELECT config_key, config_value FROM barcode_config', [], (err, rows) => {
    if (err) {
      console.error('Error getting barcode config:', err.message);
      callback({});
      return;
    }
    const config = {};
    rows.forEach(row => {
      config[row.config_key] = row.config_value;
    });
    callback(config);
  });
}

function saveBarcodeConfig(configKey, configValue, callback) {
  const now = new Date().toISOString();
  db.run(
    'INSERT OR REPLACE INTO barcode_config (config_key, config_value, updated_at) VALUES (?, ?, ?)',
    [configKey, configValue, now],
    function(err) {
      if (err) {
        console.error('Error saving barcode config:', err.message);
      }
      if (callback) callback(err);
    }
  );
}

export default {
  db,
  initialize,
  getSequenceTracker,
  updateSequenceTracker,
  getBatchSequenceTracker,
  updateBatchSequenceTracker,
  saveBatch,
  getAllBatches,
  getBarcodesByBatchCode,
  getPrintedBatches,
  markBatchAsPrinted,
  getAllBarcodes,
  getBarcodeByCode,
  updateBarcodeStatus,
  saveDeliveryRecord,
  getDeliveryRecords,
  saveReceivingRecord,
  getReceivingRecords,
  saveUsageRecord,
  getUsageRecords,
  getAllBarcodeFields,
  saveBarcodeField,
  deleteBarcodeField,
  getStatistics,
  getModelStatistics,
  getBarcodeConfig,
  saveBarcodeConfig
};