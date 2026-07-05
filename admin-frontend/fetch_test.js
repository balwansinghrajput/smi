fetch('https://smi-4n7s.vercel.app/')
  .then(r => r.text())
  .then(t => {
    const m = t.match(/src="(\/assets\/index-[a-zA-Z0-9_-]+\.js)"/);
    if (m) {
      return fetch('https://smi-4n7s.vercel.app' + m[1])
        .then(r => r.text())
        .then(js => {
          const matches = js.match(/https?:\/\/[a-zA-Z0-9\.-]+(\/api\/v1)?/g) || [];
          console.log(matches.filter(url => !url.includes('w3.org') && !url.includes('vitejs') && !url.includes('smi-4n7s.vercel.app')));
        });
    } else {
      console.log('no match');
    }
  }).catch(e => console.error(e));
