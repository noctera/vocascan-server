const {
  createLanguagePackage,
  getLanguagePackages,
  destroyLanguagePackage,
  updateLanguagePackage,
} = require('../Services/LanguagePackageServiceProvider.js');
const { createDrawers } = require('../Services/DrawerServiceProvider.js');
const { drawers } = require('../utils/constants.js');
const { getStats } = require('../Services/QueryServiceProvider.js');
const catchAsync = require('../utils/catchAsync');

const addLanguagePackage = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;

  // create language Package
  const languagePackage = await createLanguagePackage(req.body, userId);

  // store drawers for language package in database

  await createDrawers(drawers, languagePackage.id, userId);

  res.send(languagePackage);
});

const sendLanguagePackages = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;
  const groups = req.query.groups || false;
  const groupsActive = groups === 'true';

  // get language Package
  const languagePackages = await getLanguagePackages(userId, groupsActive);

  const formatted = await Promise.all(
    languagePackages.map(async (languagePackage) => ({
      ...languagePackage.toJSON(),

      stats: await getStats({
        languagePackageId: languagePackage.id,
        userId,
      }),
    }))
  );

  res.send(formatted);
});

const deleteLanguagePackage = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;
  const { languagePackageId } = req.params;

  await destroyLanguagePackage(userId, languagePackageId);

  res.status(204).end();
});

const modifyLanguagePackage = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;
  const { languagePackageId } = req.params;

  await updateLanguagePackage(req.body, userId, languagePackageId);

  res.status(204).end();
});

module.exports = {
  addLanguagePackage,
  sendLanguagePackages,
  deleteLanguagePackage,
  modifyLanguagePackage,
};
