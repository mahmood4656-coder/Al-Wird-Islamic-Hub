import https from 'https';

const searchArchive = (query: string): Promise<any> => {
  return new Promise((resolve) => {
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&fl[]=identifier,title&rows=100&output=json`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

const getMetadata = (item: string): Promise<any> => {
  return new Promise((resolve) => {
    const url = `https://archive.org/metadata/${item}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

async function check() {
  const rs = await searchArchive('"Durood" OR "Darood" OR "Salawat" OR "Shifa" OR "Tibb" OR "Quloob"');
  if (rs && rs.response && rs.response.docs) {
    console.log(`Found ${rs.response.docs.length} docs:`);
    for (const doc of rs.response.docs) {
      const lowerId = doc.identifier.toLowerCase();
      const lowerTitle = doc.title.toLowerCase();
      if ((lowerId.includes('shifa') || lowerId.includes('tibb') || lowerId.includes('quloob')) &&
          (lowerId.includes('darood') || lowerId.includes('durood') || lowerId.includes('salawat') || lowerTitle.includes('shifa') || lowerTitle.includes('tibb') || lowerTitle.includes('quloob'))) {
        console.log(`Checking ${doc.identifier} (${doc.title})...`);
        const meta = await getMetadata(doc.identifier);
        if (meta && meta.files) {
          const mp3s = meta.files.filter((f: any) => f.name.endsWith('.mp3'));
          if (mp3s.length > 0) {
            console.log(` -> Found ${mp3s.length} MP3 files inside ${doc.identifier}:`);
            mp3s.forEach((f: any) => console.log(`    - "${f.name}"`));
          }
        }
      }
    }
  }
}

check();
