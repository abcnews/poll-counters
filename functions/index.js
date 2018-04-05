const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

const db = admin.database();

const UNGROUPED_GROUP = '__ungrouped__';
const QUERY_ERROR = `Missing query parameter`;
const REFERENCE_ERROR = `Reference does not exist`;

// Return a group, question or answer

exports.get = functions.https.onRequest((req, res) => {
  cors(req, res, () => {});

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
});

// Increment an answer; return the parent question.

exports.increment = functions.https.onRequest((req, res) => {
  cors(req, res, () => {});

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
});
