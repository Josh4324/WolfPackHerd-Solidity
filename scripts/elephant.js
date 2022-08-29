// Import ethers from Hardhat package
const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  const ELEPHANT = await hre.ethers.getContractFactory("ELEPHANT");

  const elephant = await ELEPHANT.deploy();

  // here we deploy the contract
  await elephant.deployed();
  // print the address of the deployed contract
  console.log("ELEPHANT deployed to:", elephant.address);

  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(30000);

  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: elephant.address,
    constructorArguments: [],
    contract: "contracts/Elephant.sol:ELEPHANT",
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
