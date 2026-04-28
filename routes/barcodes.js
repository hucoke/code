import express from 'express';
import db from '../db.js';

const router = express.Router();

const MODEL_CODES = {
  'PET-500ml': 'P500',
  'PET-1000ml': 'P1000',
  'PET-1500ml': 'P1500',
  'PET-2000ml': 'P2000'
};

router.get('/init-data', (req, res) => {
  db.getSequenceTracker((sequenceTracker) => {
    db.getBatchSequenceTracker((batchSequenceTracker) => {
      db.getAllBatches((batches) => {
        db.getPrintedBatches((printedBatches) => {
          db.getAllBarcodes((allBarcodes) => {
            // 将编码按批次分组
            const barcodesByBatch = {};
            allBarcodes.forEach(barcode => {
              if (!barcodesByBatch[barcode.batch_code]) {
                barcodesByBatch[barcode.batch_code] = [];
              }
              barcodesByBatch[barcode.batch_code].push(barcode);
            });
            
            // 将编码关联到对应批次
            const batchesWithBarcodes = batches.map(batch => {
              return {
                ...batch,
                barcodes: barcodesByBatch[batch.batch_code] || []
              };
            });

            db.getDeliveryRecords((deliveryRecords) => {
              db.getReceivingRecords((receivingRecords) => {
                db.getUsageRecords((usageRecords) => {
                  db.getAllBarcodeFields((barcodeFields) => {
                    res.json({
                      sequenceTracker,
                      batchSequenceTracker,
                      productionBatches: batchesWithBarcodes,
                      printedBatches: [...printedBatches],
                      allBarcodes,
                      deliveryRecords,
                      receivingRecords,
                      usageRecords,
                      barcodeFields
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

router.get('/batches', (req, res) => {
  db.getAllBatches((batches) => {
    res.json(batches);
  });
});

router.get('/batches/:batchCode/barcodes', (req, res) => {
  db.getBarcodesByBatchCode(req.params.batchCode, (barcodes) => {
    res.json(barcodes);
  });
});

router.post('/generate', (req, res) => {
  const { model, quantity, productionDate, supplier, productionLine, rawMaterial } = req.body;

  console.log('=== 接收到的请求参数 ===');
  console.log('supplier:', supplier);
  console.log('productionLine:', productionLine);
  console.log('model:', model);
  console.log('rawMaterial:', rawMaterial);
  console.log('quantity:', quantity);
  console.log('productionDate:', productionDate);

  if (!model || !quantity || !productionDate) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  db.getBarcodeConfig((config) => {
    db.getDropdownOptions((allOptions) => {
      const optionsMap = {};
      allOptions.forEach(opt => {
        const key = `${opt.category}_${opt.value}`;
        optionsMap[key] = opt;
      });

      let encodingFields = ['supplier', 'model', 'productionDate', 'sequence'];
      if (config.encodingFields) {
        try {
          encodingFields = JSON.parse(config.encodingFields);
        } catch (e) {
          console.error('Error parsing encodingFields:', e);
        }
      }

      const getFieldCode = (fieldKey, format) => {
        let value = '';
        let abbreviation = '';

        switch(fieldKey) {
          case 'supplier':
            value = supplier || '';
            const supplierOpt = optionsMap[`supplier_${supplier}`];
            abbreviation = supplierOpt?.abbreviation || value.substring(0, 2);
            break;
          case 'productionLine':
            value = productionLine || '';
            const lineOpt = optionsMap[`production_line_${productionLine}`];
            abbreviation = lineOpt?.abbreviation || value.replace('LINE-', '');
            break;
          case 'model':
            value = model;
            const modelOpt = optionsMap[`model_${model}`];
            abbreviation = modelOpt?.abbreviation || (MODEL_CODES[model] || model.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4));
            break;
          case 'rawMaterial':
            value = rawMaterial || '';
            const rawOpt = optionsMap[`raw_material_${rawMaterial}`];
            abbreviation = rawOpt?.abbreviation || value.substring(0, 4);
            break;
          case 'productionDate':
            value = productionDate.replace(/-/g, '');
            abbreviation = productionDate.replace(/-/g, '').substring(2);
            break;
          case 'sequence':
            value = '';
            abbreviation = '';
            break;
          case 'batchCode':
            value = '';
            abbreviation = '';
            break;
          case 'currentTime':
            const now = new Date();
            value = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
            abbreviation = value;
            break;
          default:
            value = '';
            abbreviation = '';
        }

        if (format === 'abbreviation') return abbreviation;
        if (format === 'both') return `${abbreviation}:${value}`;
        return value;
      };

      const dateStr = productionDate.replace(/-/g, '');
      
      let modelCode = '';
      const modelOpt = optionsMap[`model_${model}`];
      if (modelOpt?.abbreviation) {
        modelCode = modelOpt.abbreviation;
      } else if (MODEL_CODES[model]) {
        modelCode = MODEL_CODES[model];
      } else {
        modelCode = model.replace(/[^a-zA-Z0-9]/g, '');
        if (modelCode.length > 10) {
          modelCode = modelCode.substring(0, 10);
        }
      }

      const trackerKey = `${modelCode}_${dateStr}`;
      const batchKey = `${modelCode}_${dateStr}`;

      db.getSequenceTracker((sequenceTracker) => {
        db.getBatchSequenceTracker((batchSequenceTracker) => {
          const lastSequence = sequenceTracker[trackerKey] || 0;
          const lastBatchSequence = batchSequenceTracker[batchKey] || 0;
          const newBatchSequence = lastBatchSequence + 1;

          const batchCode = `B${dateStr}${modelCode}${newBatchSequence.toString().padStart(3, '0')}`;

          const barcodes = [];
          for (let i = 1; i <= quantity; i++) {
            const currentSequence = lastSequence + i;
            
            let codeParts = [];
            encodingFields.forEach(fieldObj => {
              const fieldKey = typeof fieldObj === 'object' ? fieldObj.key : fieldObj;
              const format = typeof fieldObj === 'object' ? (fieldObj.format || 'abbreviation') : 'abbreviation';
              
              if (fieldKey === 'sequence') {
                codeParts.push(currentSequence.toString().padStart(4, '0'));
              } else if (fieldKey === 'batchCode') {
                codeParts.push(batchCode);
              } else {
                const part = getFieldCode(fieldKey, format);
                if (part) codeParts.push(part);
              }
            });
            
            const code = codeParts.join('');

            barcodes.push({
              code: code,
              batchCode: batchCode,
              model: model,
              modelCode: modelCode,
              productionDate: productionDate,
              sequence: currentSequence,
              supplier: supplier,
              productionLine: productionLine,
              rawMaterial: rawMaterial,
              production_line: productionLine,
              raw_material: rawMaterial
            });
          }

          const newLastSequence = lastSequence + quantity;
          sequenceTracker[trackerKey] = newLastSequence;
          batchSequenceTracker[batchKey] = newBatchSequence;

          const batch = {
            batchCode: batchCode,
            model: model,
            modelCode: modelCode,
            quantity: quantity,
            productionDate: productionDate,
            supplier: supplier,
            productionLine: productionLine,
            rawMaterial: rawMaterial,
            createdAt: new Date().toLocaleString('zh-CN')
          };

          db.updateSequenceTracker(trackerKey, newLastSequence, () => {
            db.updateBatchSequenceTracker(batchKey, newBatchSequence, () => {
              db.saveBatch(batch, barcodes, (err) => {
                if (err) {
                  return res.status(500).json({ error: '保存失败' });
                }

                res.json({
                  batch,
                  barcodes,
                  sequenceTracker,
                  batchSequenceTracker
                });
              });
            });
          });
        });
      });
    });
  });
});

router.post('/mark-printed/:batchCode', (req, res) => {
  const { batchCode } = req.params;
  db.markBatchAsPrinted(batchCode, () => {
    res.json({ success: true });
  });
});

router.get('/barcodes', (req, res) => {
  db.getAllBarcodes((barcodes) => {
    res.json(barcodes);
  });
});

router.get('/barcodes/:barcodeCode', (req, res) => {
  db.getBarcodeByCode(req.params.barcodeCode, (barcode) => {
    if (barcode) {
      res.json(barcode);
    } else {
      res.status(404).json({ error: '条码不存在' });
    }
  });
});

router.get('/delivery-records', (req, res) => {
  db.getDeliveryRecords((records) => {
    res.json(records);
  });
});

router.post('/delivery', (req, res) => {
  const { barcodeCode, model, deliveryDate, deliveryTime } = req.body;

  if (!barcodeCode) {
    return res.status(400).json({ error: '缺少条码编号' });
  }

  db.getBarcodeByCode(barcodeCode, (barcode) => {
    if (!barcode) {
      return res.status(404).json({ error: '条码不存在' });
    }

    db.updateBarcodeStatus(barcodeCode, 'delivery', deliveryDate, deliveryTime, (err) => {
      if (err) {
        return res.status(500).json({ error: '更新状态失败' });
      }

      db.saveDeliveryRecord(barcodeCode, barcode.model, deliveryDate, deliveryTime, (err) => {
        if (err) {
          return res.status(500).json({ error: '保存发货记录失败' });
        }

        res.json({ success: true, message: '发货成功' });
      });
    });
  });
});

router.get('/receiving-records', (req, res) => {
  db.getReceivingRecords((records) => {
    res.json(records);
  });
});

router.post('/receiving', (req, res) => {
  const { barcodeCode, receiveDate, receiveTime } = req.body;

  if (!barcodeCode) {
    return res.status(400).json({ error: '缺少条码编号' });
  }

  db.getBarcodeByCode(barcodeCode, (barcode) => {
    if (!barcode) {
      return res.status(404).json({ error: '条码不存在' });
    }

    db.updateBarcodeStatus(barcodeCode, 'received', receiveDate, receiveTime, (err) => {
      if (err) {
        return res.status(500).json({ error: '更新状态失败' });
      }

      db.saveReceivingRecord(barcodeCode, barcode.model, receiveDate, receiveTime, (err) => {
        if (err) {
          return res.status(500).json({ error: '保存收货记录失败' });
        }

        res.json({ success: true, message: '收货成功' });
      });
    });
  });
});

router.get('/usage-records', (req, res) => {
  db.getUsageRecords((records) => {
    res.json(records);
  });
});

router.post('/usage', (req, res) => {
  const { barcodeCode, useDate, useTime } = req.body;

  if (!barcodeCode) {
    return res.status(400).json({ error: '缺少条码编号' });
  }

  db.getBarcodeByCode(barcodeCode, (barcode) => {
    if (!barcode) {
      return res.status(404).json({ error: '条码不存在' });
    }

    db.updateBarcodeStatus(barcodeCode, 'used', useDate, useTime, (err) => {
      if (err) {
        return res.status(500).json({ error: '更新状态失败' });
      }

      db.saveUsageRecord(barcodeCode, barcode.model, useDate, useTime, (err) => {
        if (err) {
          return res.status(500).json({ error: '保存使用记录失败' });
        }

        res.json({ success: true, message: '使用成功' });
      });
    });
  });
});

router.get('/barcode-fields', (req, res) => {
  db.getAllBarcodeFields((fields) => {
    res.json(fields);
  });
});

router.post('/barcode-fields', (req, res) => {
  const { name, type } = req.body;

  if (!name) {
    return res.status(400).json({ error: '缺少字段名称' });
  }

  db.saveBarcodeField(name, type || 'text', (err) => {
    if (err) {
      return res.status(500).json({ error: '保存字段失败' });
    }

    res.json({ success: true, message: '添加成功' });
  });
});

router.delete('/barcode-fields/:id', (req, res) => {
  db.deleteBarcodeField(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: '删除字段失败' });
    }

    res.json({ success: true, message: '删除成功' });
  });
});

router.get('/dropdown-options', (req, res) => {
  const { category } = req.query;
  if (category) {
    db.getDropdownOptionsByCategory(category, (options) => {
      res.json(options);
    });
  } else {
    db.getDropdownOptions((options) => {
      res.json(options);
    });
  }
});

router.post('/dropdown-options', (req, res) => {
  const { category, value, displayOrder, abbreviation } = req.body;

  if (!category || !value) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  db.saveDropdownOption(category, value, displayOrder || 0, abbreviation || '', (err) => {
    if (err) {
      return res.status(500).json({ error: '保存选项失败' });
    }

    res.json({ success: true, message: '添加成功' });
  });
});

router.put('/dropdown-options/:id', (req, res) => {
  const { value, displayOrder, abbreviation } = req.body;

  if (!value) {
    return res.status(400).json({ error: '缺少选项值' });
  }

  db.updateDropdownOption(req.params.id, value, displayOrder || 0, abbreviation || '', (err) => {
    if (err) {
      return res.status(500).json({ error: '更新选项失败' });
    }

    res.json({ success: true, message: '更新成功' });
  });
});

router.delete('/dropdown-options/:id', (req, res) => {
  db.deleteDropdownOption(req.params.id, (err) => {
    if (err) {
      return res.status(500).json({ error: '删除选项失败' });
    }

    res.json({ success: true, message: '删除成功' });
  });
});

router.get('/statistics', (req, res) => {
  db.getStatistics((stats) => {
    db.getModelStatistics((modelStats) => {
      res.json({
        ...stats,
        modelStats
      });
    });
  });
});

router.get('/barcode-config', (req, res) => {
  db.getBarcodeConfig((config) => {
    const defaultConfig = {
      barcodeWidth: '2',
      barcodeHeight: '80',
      fontSize: '14',
      margin: '10',
      displayValue: 'true',
      showText: 'true',
      textMargin: '2',
      printWidth: '300',
      printHeight: '200',
      printPadding: '20'
    };
    res.json({ ...defaultConfig, ...config });
  });
});

router.post('/barcode-config', (req, res) => {
  const { key, value } = req.body;

  if (!key) {
    return res.status(400).json({ error: '缺少配置键' });
  }

  db.saveBarcodeConfig(key, value, (err) => {
    if (err) {
      return res.status(500).json({ error: '保存配置失败' });
    }
    res.json({ success: true, message: '保存成功' });
  });
});

router.post('/barcode-config/batch', (req, res) => {
  const config = req.body;

  let savedCount = 0;
  const keys = Object.keys(config);

  keys.forEach((key) => {
    db.saveBarcodeConfig(key, config[key], (err) => {
      savedCount++;
      if (savedCount === keys.length) {
        res.json({ success: true, message: '保存成功' });
      }
    });
  });
});

export default router;