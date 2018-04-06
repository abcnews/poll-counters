const cors = require('cors')({ origin: true });
const RateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const ABC_IPS = '203.2.218.'; // ABC-AU is allocated 203.2.218.0 to 203.2.218.255
const UNGROUPED_GROUP = '__ungrouped__';
const QUERY_ERROR = `Missing query parameter`;
const REFERENCE_ERROR = `Reference does not exist`;

admin.initializeApp();

const db = admin.database();

// Rate-limit requests for groups and/or questions from IP addresses
// outside the ABC network to 15 per 15 minute window
const limiter = new RateLimit({
  delayMs: 0,
  headers: false,
  keyGenerator: req => {
    const { group = UNGROUPED_GROUP, question } = req.query;
    return `${req.ip}${group ? `/${group}` : ''}${question ? `/${question}` : ''}`;
  },
  max: 15,
  skip: req => req.ip.indexOf(ABC_IPS) === 0,
  windowMs: 15 * 60 * 1000
});

// Return a group, question or answer
exports.get = functions.https.onRequest((req, res) =>
  cors(req, res, () =>
    limiter(req, res, () => {
      const { group, question, answer } = req.query;

      if (!group || (answer && !question)) {
        return res.json({ error: QUERY_ERROR });
      }

      const path = `${group}${question ? `/${question}${answer ? `/${answer}` : ''}` : ''}`;

      db
        .ref(path)
        .once('value')
        .then(snapshot => {
          const value = snapshot.val();

          res.json(
            value == null
              ? { error: REFERENCE_ERROR }
              : {
                  type: answer ? 'answer' : question ? 'question' : 'group',
                  path,
                  key: answer || question || group,
                  value
                }
          );
        })
        .catch(error => res.json({ error }));
    })
  )
);

// Increment an answer; return the parent question.
exports.increment = functions.https.onRequest((req, res) =>
  cors(req, res, () =>
    limiter(req, res, () => {
      const { group = UNGROUPED_GROUP, question, answer } = req.query;

      if (!question || !answer) {
        return res.json({ error: QUERY_ERROR });
      }

      const questionPath = `${group}/${question}`;
      let questionRef;

      db
        .ref(group)
        .transaction(value => (value === null ? {} : undefined))
        .then(() => (questionRef = db.ref(questionPath)).transaction(value => (value === null ? {} : undefined)))
        .then(() => db.ref(`${questionPath}/${answer}`).transaction(value => (value === null ? 1 : value + 1)))
        .then(() => questionRef.once('value'))
        .then(snapshot =>
          res.json({
            type: 'question',
            path: questionPath,
            key: question,
            value: snapshot.val()
          })
        )
        .catch(error => res.json({ error }));
    })
  )
);
