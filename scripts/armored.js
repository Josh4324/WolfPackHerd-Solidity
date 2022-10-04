// Import ethers from Hardhat package
const { ethers } = require("hardhat");

async function main() {
  // We get the contract to deploy
  const NFT = await ethers.getContractFactory("ArmoredTrunk");

  const nft = await NFT.deploy(
    "https://ipfs.io/ipfs/QmZk9m5xWGgwYWb8EnBFkT5qZAZaTDcgb7KZwV4Jr2QFLu/",
    "0x08FCc3138ded4aAf591F9466CCE4AB4b6cE3751a",
    "0x9752B50995C28a7452EDcafA518B06b4d123bD69",
    "0x33f99448316Cc616Ae1480663bb48aEa4878217a"
  );

  // here we deploy the contract
  await nft.deployed();
  // print the address of the deployed contract
  console.log("NFT deployed to:", nft.address);

  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(30000);

  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: nft.address,
    constructorArguments: [
      "https://ipfs.io/ipfs/QmZk9m5xWGgwYWb8EnBFkT5qZAZaTDcgb7KZwV4Jr2QFLu/",
      "0x08FCc3138ded4aAf591F9466CCE4AB4b6cE3751a",
      "0x9752B50995C28a7452EDcafA518B06b4d123bD69",
      "0x33f99448316Cc616Ae1480663bb48aEa4878217a",
    ],
    contract: "contracts/Armored.sol:ArmoredTrunk",
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
