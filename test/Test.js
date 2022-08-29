const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function NFT() {
    // Contracts are deployed using the first signer/account by default
    const [
      owner,
      otherAccount,
      otherAccount2,
      otherAccount3,
      otherAccount4,
      otherAccount5,
      otherAccount6,
      otherAccount7,
      otherAccount8,
    ] = await ethers.getSigners();

    const Herd = await ethers.getContractFactory("AlienTrunk");
    const Whitelist = await ethers.getContractFactory("Whitelist");
    const BUSD = await ethers.getContractFactory("BUSD");
    const Vault = await ethers.getContractFactory("Vault");

    const whitelist = await Whitelist.deploy();
    const busd = await BUSD.deploy();
    const vault = await Vault.deploy(
      [
        owner.address,
        otherAccount5.address,
        otherAccount6.address,
        otherAccount7.address,
        otherAccount8.address,
      ],
      busd.address,
      3
    );

    const herd = await Herd.deploy(
      "https://ipfs.io/ipfs/QmQ1M2uECufPiMcnAVe5ZR5HJjYXMtGmSUmJuFG6ZhseBv/",
      busd.address,
      whitelist.address,
      vault.address
    );

    return {
      herd,
      busd,
      whitelist,
      owner,
      vault,
      otherAccount,
      otherAccount2,
      otherAccount3,
      otherAccount4,
      otherAccount5,
      otherAccount6,
      otherAccount7,
      otherAccount8,
    };
  }

  describe("Deployment", function () {
    it("Should set the right whitelist address", async function () {
      const { herd, whitelist } = await loadFixture(NFT);

      expect(await herd.whitelist()).to.equal(whitelist.address);
    });

    it("Should set the right busd address", async function () {
      const { herd, busd } = await loadFixture(NFT);

      expect(await herd.tokenBUSD()).to.equal(busd.address);
    });

    it("Should set the right _baseTokenURI", async function () {
      const { herd } = await loadFixture(NFT);

      expect(await herd._baseTokenURI()).to.equal(
        "https://ipfs.io/ipfs/QmQ1M2uECufPiMcnAVe5ZR5HJjYXMtGmSUmJuFG6ZhseBv/"
      );
    });
  });

  describe("Pause", function () {
    it("Start Contract", async function () {
      const { herd } = await loadFixture(NFT);

      await herd.setPaused(true);

      expect(await herd._paused()).to.equal(true);
    });

    it("Pause Contract", async function () {
      const { herd } = await loadFixture(NFT);
      await herd.setPaused(false);

      expect(await herd._paused()).to.equal(false);
    });
  });

  describe("Presale", function () {
    it("End Presale", async function () {
      const { herd } = await loadFixture(NFT);

      await herd.startPresale();

      expect(await herd.presaleStarted()).to.equal(true);
    });

    it("Start Presale", async function () {
      const { herd } = await loadFixture(NFT);
      await herd.endPresale();

      expect(await herd.presaleStarted()).to.equal(false);
    });
  });

  describe("Token", function () {
    it("check token URI", async function () {
      const { herd } = await loadFixture(NFT);

      await herd.mintMany(10);

      expect(await herd.tokenURI(7)).to.equal(
        "https://ipfs.io/ipfs/QmQ1M2uECufPiMcnAVe5ZR5HJjYXMtGmSUmJuFG6ZhseBv/7.json"
      );

      expect(await herd.tokenURI(0)).to.equal(
        "https://ipfs.io/ipfs/QmQ1M2uECufPiMcnAVe5ZR5HJjYXMtGmSUmJuFG6ZhseBv/0.json"
      );

      await expect(herd.tokenURI(20)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });
  });

  describe("Price", function () {
    it("set price", async function () {
      const { herd } = await loadFixture(NFT);

      await herd.setPrice(2000);

      expect(await herd._price()).to.equal(2000);
    });
  });

  describe("Referral", function () {
    it("set referral", async function () {
      const { herd, otherAccount } = await loadFixture(NFT);

      await herd.setReferral(otherAccount.address);

      expect(await herd.getReferral()).to.equal(otherAccount.address);
    });
  });

  describe("BuyBack", function () {
    it("set buy back status to true", async function () {
      const { herd } = await loadFixture(NFT);

      await herd.setBuyBack(true);

      expect(await herd._buyback()).to.equal(true);
    });

    it("set buy back status to false", async function () {
      const { herd } = await loadFixture(NFT);

      await herd.setBuyBack(false);

      expect(await herd._buyback()).to.equal(false);
    });
  });

  describe("Fetch All NFTs", function () {
    it("get all nfts", async function () {
      const { herd, vault } = await loadFixture(NFT);

      await herd.mintMany(10);

      const num = await herd.fetchListItems();

      console.log(num);
      console.log(vault.address);

      expect(await num.length).to.equal(10);
    });
  });

  describe("Fetch User NFTs", function () {
    it("get user nfts", async function () {
      const { herd, busd, otherAccount } = await loadFixture(NFT);

      await herd.mintMany(10);

      await herd.setPaused(false);

      await busd.transfer(
        otherAccount.address,
        ethers.utils.parseEther("10000")
      );
      await busd
        .connect(otherAccount)
        .approve(herd.address, ethers.utils.parseEther("10000"));

      await herd.endPresale();
      await herd.connect(otherAccount).buyItemWithBUSD(0);
      await herd.connect(otherAccount).buyItemWithBUSD(1);
      await herd.connect(otherAccount).buyItemWithBUSD(2);
      await herd.connect(otherAccount).buyItemWithBUSD(3);
      await herd.connect(otherAccount).buyItemWithBUSD(4);

      const num = await herd.connect(otherAccount).fetchMyNFTs();

      expect(await num.length).to.equal(5);
    });
  });

  describe("Presale NFT", function () {
    it("Mint NFT during presale", async function () {
      const {
        herd,
        otherAccount,
        busd,
        otherAccount2,
        otherAccount3,
        otherAccount4,
        whitelist,
        vault,
      } = await loadFixture(NFT);

      await herd.mintMany(10);

      await herd.setPaused(false);
      await whitelist.addAddressToWhitelist(otherAccount.address);
      await whitelist.addAddressToWhitelist(otherAccount3.address);
      await whitelist.addAddressToWhitelist(otherAccount4.address);
      await busd.transfer(
        otherAccount.address,
        ethers.utils.parseEther("10000")
      );
      await busd.transfer(
        otherAccount4.address,
        ethers.utils.parseEther("10000")
      );
      await busd
        .connect(otherAccount)
        .approve(herd.address, ethers.utils.parseEther("10000"));

      await herd.connect(otherAccount).buyItemWithBUSDPreSale(0);

      expect(await herd.ownerOf(0)).to.equal(otherAccount.address);

      await expect(
        herd.connect(otherAccount2).buyItemWithBUSDPreSale(1)
      ).to.be.revertedWith("no whitelist");
      await expect(
        herd.connect(otherAccount3).buyItemWithBUSDPreSale(1)
      ).to.be.revertedWith("Not enough busd");
      await expect(
        herd.connect(otherAccount4).buyItemWithBUSDPreSale(1)
      ).to.be.revertedWith("Insufficient allowance");
    });
  });

  describe("NFT Sale", function () {
    it("Mint NFT after presale", async function () {
      const {
        herd,
        otherAccount,
        busd,
        otherAccount2,
        otherAccount3,
        otherAccount4,
      } = await loadFixture(NFT);

      await herd.mintMany(10);

      await herd.setPaused(false);

      await busd.transfer(
        otherAccount.address,
        ethers.utils.parseEther("10000")
      );
      await busd.transfer(
        otherAccount4.address,
        ethers.utils.parseEther("10000")
      );
      await busd
        .connect(otherAccount)
        .approve(herd.address, ethers.utils.parseEther("10000"));

      await expect(
        herd.connect(otherAccount2).buyItemWithBUSD(1)
      ).to.be.revertedWith("Presale has not ended yet");
      await herd.endPresale();
      await herd.connect(otherAccount).buyItemWithBUSD(0);

      expect(await herd.ownerOf(0)).to.equal(otherAccount.address);
      await expect(
        herd.connect(otherAccount3).buyItemWithBUSD(1)
      ).to.be.revertedWith("Not enough busd");
      await expect(
        herd.connect(otherAccount4).buyItemWithBUSD(1)
      ).to.be.revertedWith("Insufficient allowance");
    });
  });

  describe("Withdraw BUSD from vault", function () {
    it("withdraw busd to contract for buyback", async function () {
      const {
        herd,
        vault,
        otherAccount,
        busd,
        otherAccount2,
        otherAccount3,
        otherAccount4,
        otherAccount5,
        otherAccount6,
        otherAccount7,
        otherAccount8,
        owner,
      } = await loadFixture(NFT);

      await herd.mintMany(10);

      await herd.setPaused(false);

      await busd.transfer(
        otherAccount.address,
        ethers.utils.parseEther("10000")
      );

      await busd.transfer(
        otherAccount2.address,
        ethers.utils.parseEther("10000")
      );

      await busd.transfer(
        otherAccount3.address,
        ethers.utils.parseEther("10000")
      );

      await busd.transfer(
        otherAccount4.address,
        ethers.utils.parseEther("10000")
      );

      await busd
        .connect(otherAccount)
        .approve(herd.address, ethers.utils.parseEther("10000"));
      await busd
        .connect(otherAccount2)
        .approve(herd.address, ethers.utils.parseEther("10000"));
      await busd
        .connect(otherAccount3)
        .approve(herd.address, ethers.utils.parseEther("10000"));
      await busd
        .connect(otherAccount4)
        .approve(herd.address, ethers.utils.parseEther("10000"));

      await herd.endPresale();

      await herd.connect(otherAccount).buyItemWithBUSD(0);
      await herd.connect(otherAccount2).buyItemWithBUSD(1);
      await herd.connect(otherAccount3).buyItemWithBUSD(2);
      await herd.connect(otherAccount4).buyItemWithBUSD(3);

      await vault
        .connect(otherAccount5)
        .submitTransaction(owner.address, ethers.utils.parseEther("3000"));

      await vault.connect(otherAccount8).confirmTransaction(0);
      await vault.connect(otherAccount6).confirmTransaction(0);
      await vault.connect(otherAccount7).confirmTransaction(0);

      await vault.connect(otherAccount7).executeTransaction(0);

      expect(await busd.balanceOf(owner.address)).to.equal(
        ethers.utils.parseEther("99963000")
      );
    });
  });
});
