import Project from '../models/project.js';

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

// --- ГЛАВНОЕ ИЗМЕНЕНИЕ ---
// Функция createProjectFromIdea теперь является асинхронной,
// потому что она вызывает асинхронный метод Project.create.
async function createProjectFromIdea({ idea, passportId }) {
  // Проверяем, что идея существует, чтобы избежать ошибок
  if (!idea) {
    throw new Error('No idea provided to create a project');
  }

  let image = idea.image || null;

  // Возвращаем ID созданного проекта, как и ожидал контроллер
  return await Project.create({
    passportId,
    title: idea.title || 'Идея проекта',
    description: idea.description || '',
    image,
    placeId: idea.placeId || null,
  });
}

export {
  isCreateProjectIdeaCommand,
  findLastProjectIdea,
  createProjectFromIdea,
};
