const url = "https://culturalopes.base44.app/api/schemas";
const options = { headers: { api_key: "0f46b3a315864bfea3f7077ebec66320" } };
fetch(url, options)
  .then(r => r.text())
  .then(html => {
    const regex = /href="([^"]+)"/g;
    let match;
    const links = [];
    while ((match = regex.exec(html)) !== null) {
      links.push(match[1]);
    }
    console.log(links.join('\n'));
  });
