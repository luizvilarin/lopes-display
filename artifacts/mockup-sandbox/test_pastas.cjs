const fetch = require('node-fetch');

async function testPastas() {
  const url = "https://culturalopes.base44.app/api/entities/FilaPasta?limit=10";
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

testPastas();
