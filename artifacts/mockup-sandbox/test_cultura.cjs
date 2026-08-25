const fetch = require('node-fetch');

async function testCultura() {
  const url = "https://culturalopes.base44.app/api/entities/Corretor?limit=5";
  const options = {
    method: "GET",
    headers: {
      "api_key": "0f46b3a315864bfea3f7077ebec66320"
    }
  };

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}

testCultura();
