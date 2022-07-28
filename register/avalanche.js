const Web3 = require('web3');
const web3 = new Web3('https://api.avax-test.network/ext/bc/C/rpc');
web3.eth.handleRevert = true;

const chainId = 43113;

module.exports = {
  async sendTransaction(
    targetContract, methodName, accountPrivateKey, arguments) {
    try {
      const account =
        web3.eth.accounts.privateKeyToAccount(accountPrivateKey)
          .address;
      const to = targetContract.options.address;
      const nonce = web3.utils.numberToHex(
        await web3.eth.getTransactionCount(account));
      const data = targetContract.methods[methodName]
        .apply(targetContract.methods, arguments)
        .encodeABI();  // encode ABI
      const gas = web3.utils.numberToHex(
        parseInt((await web3.eth.getBlock('latest')).gasLimit - 1));
      let gasPrice = await web3.eth.getGasPrice();
      gasPrice = 50000000000;

      const tx = { account, to, chainId, data, nonce, gasPrice, gas };
      // console.log(tx);

      let signTx =
        await web3.eth.accounts.signTransaction(tx, accountPrivateKey);
      let ret = await web3.eth.sendSignedTransaction(signTx.rawTransaction);
      console.log('gasUsed: ' + methodName + ' ' + ret.gasUsed);
      return ret;
    } catch (e) {
      console.error(e);
    }
  },
  // query info from blockchain node
  async contractCall(targetContract, method, arguments) {
    let methodObj =
      targetContract.methods[method].apply(targetContract.methods, arguments);
    let ret = await methodObj.call({});
    return ret;
  }
}