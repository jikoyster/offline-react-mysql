const cors = require("cors");

const express = require('express');
const bodyParser = require('body-parser');
const { sequelize, Note } = require('./models');

const app = express();
app.use(bodyParser.json());

app.use(cors());

app.get('/api/notes', async (req, res) => {
  const notes = await Note.findAll({ order: [['id','DESC']], limit: 100 });
  res.json({ notes: notes.map(n => ({ id: n.id, text: n.text, createdAt: n.createdAt })) });
});

app.post('/sync/batch', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  const syncedLocalIds = [];
  const created = [];

  const t = await sequelize.transaction();
  try {
    for (const item of items) {
      if (item.type === 'note:create') {
        const n = await Note.create({ text: item.payload.text, createdAtClient: item.createdAt, clientLocalId: item.localId }, { transaction: t });
        syncedLocalIds.push(item.localId);
        created.push({ id: n.id, text: n.text });
      }
    }
    await t.commit();
    res.json({ ok: true, syncedLocalIds, created });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(5000, () => console.log('Server listening on :5000'));
  } catch (err) {
    console.error('Failed to start', err);
  }
})();