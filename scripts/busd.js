// Import ethers from Hardhat package
const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  const BUSD = await hre.ethers.getContractFactory("BUSD");

  const busd = await BUSD.deploy();

  // here we deploy the contract
  await busd.deployed();
  // print the address of the deployed contract
  console.log("BUSD deployed to:", busd.address);

  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(30000);

  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: busd.address,
    constructorArguments: [],
    contract: "contracts/Busd.sol:BUSD",
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
