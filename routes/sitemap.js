const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

router.get('/sitemap.xml', async (req, res) => {
  res.header('Content-Type', 'application/xml');
  const host = req.protocol + '://' + req.get('host');

  // fetch all slugs; for large collections you'd paginate or filter recent
  const docs = await Document.find({}, 'slug updatedAt').lean();
  const items = [
    `${host}/`,
    `${host}/new`,
    ...docs.map(d => `${host}/${d.slug}`)
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.map(u=>`  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;
  res.send(xml);
});

module.exports = router;