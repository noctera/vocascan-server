const { createGroup, getGroups, destroyGroup, updateGroup } = require('../Services/GroupServiceProvider.js');
const { getStats } = require('../Services/QueryServiceProvider.js');
const catchAsync = require('../utils/catchAsync');

const addGroup = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;

  // get language package id from params
  const { languagePackageId } = req.params;

  // create language Package
  const group = await createGroup(req.body, userId, languagePackageId);

  res.send(group);
});

const sendGroups = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;

  // get language package id from params
  const { languagePackageId } = req.params;

  // create language Package
  const groups = await getGroups(userId, languagePackageId);

  const formatted = await Promise.all(
    groups.map(async (group) => ({
      ...group.toJSON(),

      stats: await getStats({
        groupId: group.id,
        languagePackageId,
        userId,
      }),
    }))
  );

  res.send(formatted);
});

const deleteGroup = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;
  const { groupId } = req.params;

  await destroyGroup(userId, groupId);

  res.status(204).end();
});

const modifyGroup = catchAsync(async (req, res) => {
  // get userId from request
  const userId = req.user.id;
  const { groupId } = req.params;

  await updateGroup(req.body, userId, groupId);

  res.status(204).end();
});

module.exports = {
  addGroup,
  sendGroups,
  deleteGroup,
  modifyGroup,
};
