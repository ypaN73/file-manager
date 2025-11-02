import readline from 'readline';
import { homedir } from 'os';
import { handleOperation, InputError, OperationError } from './operations.js';
import { goUp, goToDir, showFiles } from './navigation.js';

class FileManager {
  constructor(username) {
    this.user = username.charAt(0).toUpperCase() + username.slice(1);
    this.currentPath = homedir();
    this.interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.setupExitHandlers();
  }

  setupExitHandlers() {
    this.interface.on('SIGINT', () => {
      this.closeApp();
    });
  }

  async init() {
    console.log(`Welcome to the File Manager, ${this.user}!`);
    this.showPath();
    await this.waitForCommand();
  }

  showPath() {
    console.log(`You are currently in ${this.currentPath}`);
  }

  async waitForCommand() {
    this.interface.question('> ', async (input) => {
      try {
        await this.processInput(input.trim());
      } catch (err) {
        if (err.message === 'close') {
          this.closeApp();
          return;
        }
        await this.waitForCommand();
      }
    });
  }

  async processInput(input) {
    if (input === '') {
      await this.waitForCommand();
      return;
    }

    if (input === '.exit') {
      this.closeApp();
      return;
    }

    const parts = input.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    try {
      switch (command) {
        case 'up':
          await this.moveUp();
          break;
        case 'cd':
          await this.changeDir(args);
          break;
        case 'ls':
          await this.listFiles();
          break;
        default:
          await handleOperation(command, args, this.currentPath);
          break;
      }
    } catch (err) {
      if (err instanceof InputError) {
        console.log('Invalid input');
      } else if (err instanceof OperationError) {
        console.log('Operation failed');
      } else {
        console.log('Operation failed');
      }
    }

    this.showPath();
    await this.waitForCommand();
  }

  async moveUp() {
    this.currentPath = await goUp(this.currentPath);
  }

  async changeDir(args) {
    if (args.length !== 1) {
      throw new InputError('cd needs one argument');
    }
    this.currentPath = await goToDir(this.currentPath, args[0]);
  }

  async listFiles() {
    await showFiles(this.currentPath);
  }

  closeApp() {
    console.log(`\nThank you for using File Manager, ${this.user}, goodbye!`);
    this.interface.close();
    process.exit(0);
  }
}

const getUsernameFromArgs = () => {
  const args = process.argv.slice(2);
  const userArg = args.find(arg => arg.startsWith('--username='));
  if (!userArg) {
    console.error('Use --username=YourName');
    process.exit(1);
  }
  return userArg.split('=')[1];
};

const username = getUsernameFromArgs();
const app = new FileManager(username);
app.init().catch(console.error);