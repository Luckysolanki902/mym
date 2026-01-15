#!/usr/bin/env node

/**
 * Script to bump Android versionCode and patch version (z in x.y.z)
 * Run with: node scripts/bump-android-version.js
 */

const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');

try {
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Extract current versionCode
  const versionCodeMatch = content.match(/versionCode\s+(\d+)/);
  if (!versionCodeMatch) {
    console.error('❌ Could not find versionCode in build.gradle');
    process.exit(1);
  }
  const currentVersionCode = parseInt(versionCodeMatch[1], 10);
  const newVersionCode = currentVersionCode + 1;
  
  // Extract current versionName (x.y.z or x.y format)
  const versionNameMatch = content.match(/versionName\s+"([\d.]+)"/);
  if (!versionNameMatch) {
    console.error('❌ Could not find versionName in build.gradle');
    process.exit(1);
  }
  const currentVersionName = versionNameMatch[1];
  
  // Parse version parts
  const versionParts = currentVersionName.split('.');
  let major = parseInt(versionParts[0], 10) || 1;
  let minor = parseInt(versionParts[1], 10) || 0;
  let patch = parseInt(versionParts[2], 10) || 0;
  
  // Increment patch version (z in x.y.z)
  patch += 1;
  
  const newVersionName = `${major}.${minor}.${patch}`;
  
  // Replace in content
  content = content.replace(
    /versionCode\s+\d+/,
    `versionCode ${newVersionCode}`
  );
  content = content.replace(
    /versionName\s+"[\d.]+"/,
    `versionName "${newVersionName}"`
  );
  
  // Write back
  fs.writeFileSync(buildGradlePath, content, 'utf8');
  
  console.log(`✅ Android version bumped:`);
  console.log(`   versionCode: ${currentVersionCode} → ${newVersionCode}`);
  console.log(`   versionName: ${currentVersionName} → ${newVersionName}`);
  
  // Stage the changes
  const { execSync } = require('child_process');
  execSync(`git add ${buildGradlePath}`, { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error bumping version:', error.message);
  process.exit(1);
}
