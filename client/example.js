const { Client } = require('.');

const GROUP = '__example__';
const QUESTION = 'x';
const ANSWER = 'y';

const client = new Client(GROUP);

// Increment answer
client.increment({ question: QUESTION, answer: ANSWER }, (err, question) => {
  console.log(`increment(${GROUP}/${QUESTION}/${ANSWER})`, err, question);

  // Get answer
  client.get({ question: QUESTION, answer: ANSWER }, (err, answer) => {
    console.log(`get(${GROUP}/${QUESTION}/${ANSWER})`, err, answer);
  });

  // Get question
  client.get({ question: QUESTION }, (err, question) => {
    console.log(`get(${GROUP}/${QUESTION})`, err, question);
  });

  // Get group
  client.get((err, group) => {
    console.log(`get(${GROUP})`, err, group);
  });

  // Increment again, with no response expected
  setTimeout(() => {
    client.increment({ question: QUESTION, answer: ANSWER });
  }, 1000);
});
