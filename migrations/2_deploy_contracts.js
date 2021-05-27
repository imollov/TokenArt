const MemeArt = artifacts.require("MemeArt");

module.exports = async function(deployer) {
  await deployer.deploy(MemeArt);

  const instance = await MemeArt.deployed()
  const forwarderAddress = require('../src/gsn/Forwarder.json').address
  await instance.setTrustedForwarder(forwarderAddress)
  console.log(`Successfully set Trusted Forwarder (${forwarderAddress}) on Recipient (${instance.address})`)
};
