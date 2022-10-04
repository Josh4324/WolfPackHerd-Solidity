// Import ethers from Hardhat package
const hre = require("hardhat");

async function main() {
  // We get the contract to deploy

  const Vault = await hre.ethers.getContractFactory("Vault");

  const vault = await Vault.deploy(
    [
      "0xCF59aC8b973A5B1fF452f2d1654899F97edecdFF",
      "0x1443498Ef86df975D8A2b0B6a315fB9f49978998",
      "0x73949Ecc27aBF4A4cc985A252099Cddd983677A2",
    ],
    "0x08FCc3138ded4aAf591F9466CCE4AB4b6cE3751a",
    3
  );

  // here we deploy the contract
  await vault.deployed();
  // print the address of the deployed contract
  console.log("Vault deployed to:", vault.address);

  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(30000);

  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: vault.address,
    constructorArguments: [
      [
        "0xCF59aC8b973A5B1fF452f2d1654899F97edecdFF",
        "0x1443498Ef86df975D8A2b0B6a315fB9f49978998",
        "0x73949Ecc27aBF4A4cc985A252099Cddd983677A2",
      ],
      "0x08FCc3138ded4aAf591F9466CCE4AB4b6cE3751a",
      3,
    ],
    contract: "contracts/Vault.sol:Vault",
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
