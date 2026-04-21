fetch('https://www.instagram.com/instagram/')
  .then(res => res.text())
  .then(html => {
    // Look for biography string in the raw HTML
    const match = html.match(/"biography":"(.*?)"/);
    console.log("Found biography field:", match ? match[1] : "No match");
  })
  .catch(console.error);
