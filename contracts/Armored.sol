// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Whitelist.sol";
import "./Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Busd.sol";
import "./Vault.sol";

/// @title ArmoredTrunk NFT
/// @author Joshua Adesanya
/// @notice You can use this contract for only the most basic simulation
contract ArmoredTrunk is ERC721URIStorage, Ownable, ReentrancyGuard {
    // Airdrop
    // Lottery
    //initial NFT owner
    // multisig

    using Counters for Counters.Counter;
    Counters.Counter private tokenIds;
    /**
     * @dev _baseTokenURI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`.
     */
    string public _baseTokenURI;

    BUSD public tokenBUSD;
    Vault public vault;

    // Whitelist contract instance
    Whitelist public whitelist;

    //  _price is the price of one Alien NFT
    uint256 public _price = 500 ether;

    // referral fee
    uint256 internal constant referralFee = 1;

    // boolean to keep track of _buyback status
    bool public _buyback = false;

    // number of NFTs currently available
    uint256 public _available = 10;

    // _paused is used to pause the contract in case of an emergency
    bool public _paused = true;

    // boolean to keep track of whether presale started or not
    bool public presaleStarted = true;

    // List Item Struct
    struct ListItem {
        address owner;
        uint256 price;
        bool sold;
        uint256 tokenId;
    }

    mapping(uint256 => ListItem) ListItems;
    mapping(address => address) Referral;

    modifier onlyWhenNotPaused() {
        require(!_paused, "Contract currently paused");
        _;
    }

    /**
     * @dev ERC721 constructor takes in a `name` and a `symbol` to the token collection.
     * name in our case is `HERDS` and symbol is `HD`.
     * Constructor for HERDS takes in the baseURI to set _baseTokenURI for the collection.
     * It also initializes an instance of whitelist interface.
     */
    constructor(
        string memory baseURI,
        address busd_addr,
        address _whitelist_addr,
        address _vault
    ) ERC721("AlienTrunk", "AT") {
        _baseTokenURI = baseURI;
        tokenBUSD = BUSD(busd_addr);
        whitelist = Whitelist(_whitelist_addr);
        vault = Vault(_vault);
    }

    /**
     * @dev mint allows contract owner to mint 1 NFT per transaction.
     */
    function mint() public onlyOwner {
        uint256 newTokenId = tokenIds.current();
        _mint(address(vault), newTokenId);
        ListItem memory item = ListItem(
            address(vault),
            _price,
            false,
            newTokenId
        );
        ListItems[newTokenId] = item;
        tokenIds.increment();
    }

    /**
     * @dev mint allows contract owner to mint num number of nfts.
     */
    function mintMany(uint256 num) external onlyOwner {
        for (uint256 i = 0; i < num; i++) {
            mint();
        }
    }

    /**
     * @dev startPresale starts a presale for the whitelisted addresses
     */
    function startPresale() public onlyOwner {
        presaleStarted = true;
    }

    /**
     * @dev endPresale ends presale
     */
    function endPresale() public onlyOwner {
        presaleStarted = false;
    }

    /**
     * @dev _baseURI overides the Openzeppelin's ERC721 implementation which by default
     * returned an empty string for the baseURI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        _requireMinted(tokenId);

        string memory t = string(
            abi.encodePacked(Strings.toString(tokenId), ".json")
        );
        return
            bytes(_baseTokenURI).length > 0
                ? string(abi.encodePacked(_baseTokenURI, t))
                : "";
    }

    /**
     * @dev setPaused makes the contract paused or unpaused
     */
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    /**
     * @dev setPrice changes the price of the NFT collection
     */
    function setPrice(uint256 val) public onlyOwner {
        _price = val;
    }

    /**
     * @dev getReferral shows the msg.sender referral addresss
     */
    function getReferral() public view returns (address) {
        return Referral[msg.sender];
    }

    /**
     * @dev setReferral set the msg.sender referral addresss
     */
    function setReferral(address val) public {
        Referral[msg.sender] = val;
    }

    /**
     * @dev setBuyBack sets the buyback status.
     */
    function setBuyBack(bool val) public onlyOwner {
        _buyback = val;
    }

    /**
     * @dev listItem list and set nft price;
     */
    function listItem(uint256 tokenId, uint256 price)
        external
        onlyWhenNotPaused
    {
        require(
            ownerOf(tokenId) == msg.sender,
            "You do not have access to this NFT"
        );

        ListItems[tokenId].sold = false;
        ListItems[tokenId].price = price;
    }

    /* Returns all unsold List items */
    function fetchListItems() public view returns (ListItem[] memory) {
        uint256 itemCount = tokenIds.current();
        uint256 currentIndex = 0;

        ListItem[] memory items = new ListItem[](itemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            uint256 currentId = i;

            ListItem storage currentItem = ListItems[currentId];
            items[currentIndex] = currentItem;

            currentIndex += 1;
        }
        return items;
    }

    /* Returns all msg.sender List items */
    function fetchMyNFTs() public view returns (ListItem[] memory) {
        uint256 totalItemCount = tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (ListItems[i].owner == msg.sender) {
                itemCount += 1;
            }
        }

        ListItem[] memory items = new ListItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (ListItems[i].owner == msg.sender) {
                uint256 currentId = i;
                ListItem storage currentItem = ListItems[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /**
     * @dev buy NFT with BUSD;
     */
    function buyItemWithBUSD(uint256 tokenId)
        public
        nonReentrant
        onlyWhenNotPaused
    {
        require(ListItems[tokenId].sold == false, "Not for sale");
        require(presaleStarted == false, "Presale has not ended yet");
        require(
            tokenBUSD.balanceOf(msg.sender) >= ListItems[tokenId].price,
            "Not enough busd"
        );
        require(
            tokenBUSD.allowance(msg.sender, address(this)) >=
                ListItems[tokenId].price,
            "Insufficient allowance"
        );
        require(
            tokenBUSD.transferFrom(
                msg.sender,
                ListItems[tokenId].owner,
                ListItems[tokenId].price
            ),
            "An error occured, make sure you approve the contract"
        );
        _transfer(ListItems[tokenId].owner, msg.sender, tokenId);
        ListItems[tokenId].sold = true;
        ListItems[tokenId].owner = msg.sender;
    }

    /**
     * @dev buy NFT with BUSD during presale;
     */
    function buyItemWithBUSDPreSale(uint256 tokenId)
        public
        nonReentrant
        onlyWhenNotPaused
    {
        require(ListItems[tokenId].sold == false, "Not for sale");
        require(presaleStarted == true, "Presale has not ended yet");
        require(whitelist.whitelist(msg.sender), "no whitelist");
        require(
            tokenBUSD.balanceOf(msg.sender) >= ListItems[tokenId].price,
            "Not enough busd"
        ); //checks that enough eth
        require(
            tokenBUSD.allowance(msg.sender, address(this)) >=
                ListItems[tokenId].price,
            "Insufficient allowance"
        );

        uint256 Per = (ListItems[tokenId].price / 100) * (referralFee);
        uint256 actualPrice = ListItems[tokenId].price - Per;
        if (Referral[msg.sender] != address(0)) {
            require(
                tokenBUSD.transferFrom(
                    msg.sender,
                    ListItems[tokenId].owner,
                    actualPrice
                ),
                "An error occured, make sure you approve the contract"
            );
            require(
                tokenBUSD.transferFrom(msg.sender, Referral[msg.sender], Per),
                "An error occured, make sure you approve the contract"
            );
        } else {
            require(
                tokenBUSD.transferFrom(
                    msg.sender,
                    ListItems[tokenId].owner,
                    ListItems[tokenId].price
                ),
                "An error occured, make sure you approve the contract"
            );
        }
        _transfer(ListItems[tokenId].owner, msg.sender, tokenId);
        ListItems[tokenId].sold = true;
        ListItems[tokenId].owner = msg.sender;
    }

    /**
     * @dev get back busd with tokenID;
     */
    function buyBack(uint256 tokenId) public {
        require(_buyback == true, "Buyback is not active");
        require(
            ownerOf(tokenId) == msg.sender,
            "You do not have access to this NFT"
        );
        require(
            tokenBUSD.balanceOf(address(this)) >= ListItems[tokenId].price,
            "Not enough busd"
        ); //checks that enough eth
        require(
            tokenBUSD.transfer(msg.sender, _price),
            "An error occured, make sure you approve the contract"
        );
        _transfer(msg.sender, _owner, tokenId);
        ListItems[tokenId].sold = false;
        ListItems[tokenId].owner = _owner;
    }
}
