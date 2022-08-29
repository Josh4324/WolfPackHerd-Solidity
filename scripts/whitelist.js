// Import ethers from Hardhat package
const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  const Whitelist = await hre.ethers.getContractFactory("Whitelist");

  const wl = await Whitelist.deploy();

  // here we deploy the contract
  await wl.deployed();
  // print the address of the deployed contract
  console.log("Whitelist deployed to:", wl.address);

  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(30000);

  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: wl.address,
    constructorArguments: [],
  });

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
