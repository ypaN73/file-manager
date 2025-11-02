import { readdir, stat } from 'fs/promises';
import { resolve, dirname } from 'path';
import { OperationError } from './operations.js';

export const goUp = async (current) => {
  const parent = dirname(current);

  if (parent === current) {
    return current;
  }

  try {
    await stat(parent);
    return parent;
  } catch {
    throw new OperationError('Cannot go up');
  }
};

export const goToDir = async (current, target) => {
  try {
    const newPath = resolve(current, target);
    const info = await stat(newPath);

    if (!info.isDirectory()) {
      throw new OperationError('Not a directory');
    }

    return newPath;
  } catch (err) {
    if (err instanceof OperationError) {
      throw err;
    }
    throw new OperationError('Directory not found');
  }
};

export const showFiles = async (current) => {
  try {
    const items = await readdir(current);
    const detailedItems = await Promise.all(
      items.map(async (item, index) => {
        try {
          const fullPath = resolve(current, item);
          const info = await stat(fullPath);
          return {
            name: item,
            type: info.isDirectory() ? 'directory' : 'file',
            isDirectory: info.isDirectory(),
            index: index
          };
        } catch {
          return { name: item, type: 'unknown', isDirectory: false, index: index };
        }
      })
    );

    detailedItems.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    detailedItems.forEach((item, newIndex) => {
      item.index = newIndex;
    });

    console.log('');
    console.log('(index)'.padEnd(10) + 'Name'.padEnd(30) + 'Type');

    detailedItems.forEach(item => {
      const indexStr = item.index.toString().padEnd(10);
      const nameStr = `'${item.name}'`.padEnd(30);
      const typeStr = `'${item.type}'`;
      console.log(`${indexStr}${nameStr}${typeStr}`);
    });

    console.log('');
  } catch {
    throw new OperationError('Cannot read directory');
  }
};