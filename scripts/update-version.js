#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

// 获取最新的git提交日期
try {
  const lastUpdate = execSync('git log -1 --format="%ci"', { encoding: 'utf8' }).trim();
  
  // 创建版本信息文件
  const versionInfo = {
    version: '1.0.0',
    lastUpdate: lastUpdate
  };
  
  fs.writeFileSync('./src/version.json', JSON.stringify(versionInfo, null, 2));
  console.log('版本信息已更新:', versionInfo);
} catch (error) {
  console.error('获取版本信息失败:', error.message);
  // 如果git命令失败，使用当前日期
  const fallbackVersion = {
    version: '1.0.0',
    lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  fs.writeFileSync('./src/version.json', JSON.stringify(fallbackVersion, null, 2));
  console.log('使用 fallback 版本信息:', fallbackVersion);
}