import os from 'os';
import { InputError } from './operations.js';

const checkArgs = (args, needed, cmd) => {
  if (args.length !== needed) {
    throw new InputError(`${cmd} needs ${needed} arguments`);
  }
};

export const getSystemInfo = async (args) => {
  checkArgs(args, 1, 'os');

  switch (args[0]) {
    case '--EOL':
      console.log(JSON.stringify(os.EOL));
      break;
    case '--cpus':
      const processors = os.cpus();
      console.log(`Total CPUs: ${processors.length}`);
      processors.forEach((cpu, i) => {
        console.log(`${i + 1}. Model: ${cpu.model}, Speed: ${(cpu.speed / 1000).toFixed(2)} GHz`);
      });
      break;
    case '--homedir':
      console.log(os.homedir());
      break;
    case '--username':
      console.log(os.userInfo().username);
      break;
    case '--architecture':
      console.log(os.arch());
      break;
    default:
      throw new InputError('Unknown system parameter');
  }
};