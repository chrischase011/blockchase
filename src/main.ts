import Block from './core/block'
import * as CryptoJS from 'crypto-js';

class Blockchain {

  private blockchain: Block[]
  private genesisBlock: Block

  constructor() {
    this.genesisBlock = new Block(
      0, '816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7', '', 1465154705, 'my genesis block!!', 0, 0
    );

    this.blockchain = [this.genesisBlock];
  }

  start() {
    const newBlock: Block = this.generateNextBlock('test block');
    console.log(newBlock);
  }

  calculateHash = (index: number, previousHash: string, timestamp: number, data: string, difficulty: number, nonce: number): string =>
    CryptoJS.SHA256(index + previousHash + timestamp + data + difficulty + nonce).toString();

  calculateHashForBlock = (block: Block): string =>
    this.calculateHash(block.index, block.previousHash, block.timestamp, block.data, block.difficulty, block.nonce);

  getLatestBlock = (): Block => this.blockchain[this.blockchain.length - 1];

  getBlockchain = (): Block[] => this.blockchain

  generateNextBlock = (blockData: string) => {
    const previousBlock: Block = this.getLatestBlock();
    const nextIndex: number = previousBlock.index + 1;
    const nextTimestamp: number = new Date().getTime() / 1000;
    const difficulty: number = 0;
    const nonce: number = 0;
    const nextHash: string = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData, difficulty, nonce);
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, blockData, difficulty, nonce);
    return newBlock;
  }

  isValidNewBlock = (newBlock: Block, previousBlock: Block) => {
    if (previousBlock.index + 1 !== newBlock.index) {
      console.log('invalid index');
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log('invalid previoushash');
      return false;
    } else if (this.calculateHashForBlock(newBlock) !== newBlock.hash) {
      console.log(typeof (newBlock.hash) + ' ' + typeof this.calculateHashForBlock(newBlock));
      console.log('invalid hash: ' + this.calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
      return false;
    }
    return true;
  };

  isValidBlockStructure = (block: Block): boolean => {
    return typeof block.index === 'number'
      && typeof block.hash === 'string'
      && typeof block.previousHash === 'string'
      && typeof block.timestamp === 'number'
      && typeof block.data === 'string';
  };

  isValidChain = (blockchainToValidate: Block[]): boolean => {
    const isValidGenesis = (block: Block): boolean => {
      return JSON.stringify(block) === JSON.stringify(this.genesisBlock);
    };

    if (!isValidGenesis(blockchainToValidate[0])) {
      return false;
    }

    for (let i = 1; i < blockchainToValidate.length; i++) {
      if (!this.isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
        return false;
      }
    }
    return true;
  };

  replaceChain = (newBlocks: Block[]) => {
    if (this.isValidChain(newBlocks) && newBlocks.length > this.getBlockchain().length) {
      console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
      this.blockchain = newBlocks;
      console.log(this.getLatestBlock());
    } else {
      console.log('Received blockchain invalid');
    }
  };


}
const app = new Blockchain()
app.start()