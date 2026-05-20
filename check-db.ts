import { getDb } from './api/db.js';

async function checkDb() {
  console.log('🔍 Checking database...\n');
  const db = await getDb();

  // List tables
  console.log('📋 Tables in database:');
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  tables.forEach(t => console.log(`  - ${t.name}`));

  // Check classes table
  console.log('\n🏫 Classes table structure:');
  const cols = await db.all("PRAGMA table_info(classes)");
  cols.forEach(c => console.log(`  - ${c.name}: ${c.type}`));

  // Check existing classes
  console.log('\n📚 Existing classes:');
  const classes = await db.all("SELECT * FROM classes");
  if (classes.length === 0) {
    console.log('  No classes found');
  } else {
    classes.forEach(c => console.log(`  - ${JSON.stringify(c)}`));
  }

  // Check teachers
  console.log('\n👨‍🏫 Teachers:');
  const teachers = await db.all("SELECT id, name FROM users WHERE role = 'teacher'");
  if (teachers.length === 0) {
    console.log('  No teachers found');
  } else {
    teachers.forEach(t => console.log(`  - ${t.id}: ${t.name}`));
  }
}

checkDb().catch(console.error);
