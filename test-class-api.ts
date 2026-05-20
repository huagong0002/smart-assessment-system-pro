import http from 'http';

// First, get auth token
async function getToken() {
  return new Promise<string>((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });

    const options = {
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.token);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testCreateClass(token: string) {
  return new Promise<void>((resolve, reject) => {
    const postData = JSON.stringify({
      name: '测试班级',
      teacher_id: '2',
      grade: '6'
    });

    const options = {
      hostname: '127.0.0.1',
      port: 3001,
      path: '/api/classes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('📤 Sending request:');
    console.log('  URL:', `http://127.0.0.1:3001/api/classes`);
    console.log('  Data:', postData);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('\n📥 Response:');
        console.log('  Status:', res.statusCode);
        console.log('  Headers:', res.headers);
        console.log('  Body:', data);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log('🔑 Getting auth token...');
    const token = await getToken();
    console.log('✅ Token:', token.substring(0, 20) + '...');

    console.log('\n🏫 Testing create class...');
    await testCreateClass(token);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
