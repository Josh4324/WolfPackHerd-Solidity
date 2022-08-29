// Import ethers from Hardhat package
const { ethers } = require("hardhat");

async function main() {
  // We get the contract to deploy
  const NFT = await ethers.getContractFactory("AlienTrunk");

  const nft = await NFT.deploy(
    "https://ipfs.io/ipfs/QmfNp18JBrXC81z8v5RY9pTS8Y9JLwT4LkehLgigiJyEa1/",
    "0x08FCc3138ded4aAf591F9466CCE4AB4b6cE3751a",
    "0x229f8cc529Ec1d9a3CD038ea76630f8031Dea430",
    "0x9752B50995C28a7452EDcafA518B06b4d123bD69"
  );

  // here we deploy the contract
  await nft.deployed();
  // print the address of the deployed contract
  console.log("NFT deployed to:", nft.address);

  console.log("Sleeping.....");
  // Wait for etherscan to notice that the contract has been deployed
  await sleep(60000);

  // Verify the contract after deploying
  await hre.run("verify:verify", {
    address: nft.address,
    constructorArguments: [
      "https://ipfs.io/ipfs/QmfNp18JBrXC81z8v5RY9pTS8Y9JLwT4LkehLgigiJyEa1/",
      "0x08FCc3138ded4aAf591F9466CCE4AB4b6cE3751a",
      "0x229f8cc529Ec1d9a3CD038ea76630f8031Dea430",
      "0x9752B50995C28a7452EDcafA518B06b4d123bD69",
    ],
    contract: "contracts/Alien.sol:AlienTrunk",
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
