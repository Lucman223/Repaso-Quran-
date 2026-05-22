fetch('https://everyayah.com/data/')
  .then(r => r.text())
  .then(t => {
    const matches = t.match(/href=\"([^\"]*minsh[^\"]*)\"/gi);
    console.log(matches);
  });
