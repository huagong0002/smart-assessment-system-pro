import http from 'http';

function testApi() {
  console.log('Testing API connection...\n');
  
  const options = {
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/classes',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ API Status:', res.statusCode);
    console.log('✅ Headers:', JSON.stringify(res.headers));
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n✅ API Response:');
      console.log(data);
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
  });

  req.end();
}

testApi();
