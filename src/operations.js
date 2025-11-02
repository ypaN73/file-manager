import { doFileOperations } from './fileOps.js';
import { doStreamOperations } from './streamOps.js';
import { getSystemInfo } from './systemInfo.js';

export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
  }
}

export class OperationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OperationError';
  }
}

export const handleOperation = async (operation, args, currentDir) => {
  const streamOps = ['cat', 'cp', 'mv', 'hash', 'compress', 'decompress'];
  const fileOps = ['add', 'mkdir', 'rn', 'rm'];
  const systemOps = ['os'];

  if (streamOps.includes(operation)) {
    await doStreamOperations(operation, args, currentDir);
  } else if (fileOps.includes(operation)) {
    await doFileOperations(operation, args, currentDir);
  } else if (systemOps.includes(operation)) {
    await getSystemInfo(args);
  } else {
    throw new InputError(`Unknown command: ${operation}`);
  }
};