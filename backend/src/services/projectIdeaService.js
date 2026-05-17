'use strict';

const Project = require('../models/project');
const callModel = require('../utils/callModel');

function isCreateProjectIdeaCommand(message) {
  const normalizedMessage = message.trim().toLowerCase();

  return [
    'создать идею проекта',
    'создай идею проекта',
    'создать проект',
    'создай проект',
  ].includes(normalizedMessage);
}

function parseMetadata(metadata) {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === 'object') {
    return metadata;
  }

  try {
    return JSON.parse(metadata);
  } catch {
    return null;
  }
}

function findLastProjectIdea(messages) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const metadata = parseMetadata(messages[index].metadata);

    if (metadata?.title || metadata?.description) {
      return metadata;
    }
  }

  return null;
}

async function createProjectFromIdea({ idea, passportId }) {
  let image = idea.image || null;

  return callModel(Project.create, {
    passportId,
    title: idea.title || 'Идея проекта',
    description: idea.description || '',
    image,
    placeId: idea.placeId || null,
  });
}

module.exports = {
  isCreateProjectIdeaCommand,
  findLastProjectIdea,
  createProjectFromIdea,
};
