const { Drawer, VocabularyCard, Translation } = require('../../database');

// return the number of unresolved vocabulary
async function getUnresolvedVocabulary(languagePackageId, userId) {
  // Get drawers belonging to languagePackage
  const drawers = await Drawer.findAll({
    attributes: ['id', 'name', 'queryInterval'],
    where: {
      userId,
      languagePackageId,
    },
  });

  let number = 0;

  await Promise.all(
    Object.keys(drawers).map(async (key) => {
      // create date and add days from query Interval
      let queryDate = new Date();
      // subtract query interval from actual date
      queryDate.setDate(queryDate.getDate() - drawers[key].queryInterval);

      // compare query date with with last query
      // if queryDate is less than lastQuery: still time
      // if queryDate more than lastQuery: waiting time is over

      const result = await VocabularyCard.count({
        where: {
          drawerId: drawers[key].id,
          lastQuery: { lt: queryDate },
        },
      });
      number += Number(result);
    })
  );

  return number;
}

// return the number of unresolved vocabulary
async function getQueryVocabulary(languagePackageId, userId, limit) {
  // Get drawers belonging to languagePackage
  const drawers = await Drawer.findAll({
    attributes: ['id', 'name', 'queryInterval'],
    where: {
      userId,
      languagePackageId,
    },
  });

  const vocabs = [];

  /* eslint-disable no-await-in-loop */
  for (const drawer of Object.values(drawers)) {
    // subtract size of vocabs returned to update the limit
    const vocabularyLimit = limit - vocabs.length;

    // create date and add days from query Interval
    const queryDate = new Date();
    // subtract query interval from actual date
    queryDate.setDate(queryDate.getDate() - drawer.queryInterval);

    // compare query date with with last query
    // if queryDate is less than lastQuery: still time
    // if queryDate more than lastQuery: waiting time is over
    const vocabularies = await VocabularyCard.findAll({
      include: [
        {
          model: Translation,
          attributes: ['name'],
        },
      ],
      limit: vocabularyLimit,
      attributes: ['id', 'name'],
      where: {
        drawerId: drawer.id,
        lastQuery: { lt: queryDate },
      },
    });

    vocabs.push(...vocabularies);
  }
  /* eslint-enable no-await-in-loop */

  return vocabs.map((vocab) => vocab.toJSON());
}

// function to handle correct query
async function handleCorrectQuery(userId, vocabularyId) {
  // fetch selected vocabulary card
  const vocabularyCard = await VocabularyCard.find({
    include: [
      {
        model: Drawer,
        attributes: ['name'],
      },
    ],
    attributes: ['id', 'name', 'drawerId'],
    where: {
      userId,
      id: vocabularyId,
    },
  });

  // push vocabulary card one drawer up
  // get drawer id from name

  const newDrawerName = String(Number(vocabularyCard.Drawer.name) + 1);

  const drawer = await Drawer.find({
    attributes: ['id'],
    where: {
      userId,
      name: newDrawerName,
    },
  });
  if (!drawer) {
    // if no output there is no next drawer => stop
    console.log('Already in the last drawer');
    return;
  }

  // update drawerId for vocabulary card
  vocabularyCard.drawerId = drawer.id;

  // save to db
  await vocabularyCard.save();
}

// function to handle wrong query
async function handleWrongQuery(userId, vocabularyId) {}

module.exports = {
  getUnresolvedVocabulary,
  getQueryVocabulary,
  handleCorrectQuery,
  handleWrongQuery,
};
