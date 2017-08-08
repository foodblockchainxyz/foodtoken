const promisify = require("es6-promisify");

const DEPLOY_GAS_LIMIT = 1500000;

let instance = null;

class TokenSingleton {

  constructor(tokenJSON = require('../build/contracts/MockToken.json')) {
    if (instance) {
      return instance;
    }
    instance = this;
    this.TokenContract = web3.eth.contract(tokenJSON.abi);
    this.data = tokenJSON.unlinked_binary;
  }

  create(addresses = [web3.eth.accounts[0]], amounts = [0], transactionHashCallback) {
    const transactionParams = {
      from: web3.eth.accounts[0],
      gas: DEPLOY_GAS_LIMIT,
      data: this.data
    }
    
    return new Promise((resolve, reject) => {
      this.TokenContract.new(addresses, amounts, transactionParams,
        async (err, newTokenContract) => {
          if (err) {
            reject(err);
          } else if (!newTokenContract.address && transactionHashCallback) {
            transactionHashCallback(newTokenContract.transactionHash);
          } else if (newTokenContract.address) {
            this.contract = newTokenContract;
            resolve(this);
          }
        });
    });
  }

  async balanceOf(address = web3.eth.accounts[0]) {
    return await promisify(this.contract.balanceOf)(address);
  }
}

module.exports = TokenSingleton;