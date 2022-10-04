//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./Ownable.sol";

contract WOLF is Ownable {
    mapping(address => address) Referral;

    // referral fee
    uint256 public constant referralFee = 2;

    // royalty fee
    uint256 public royaltyFee = 6;

    // boolean to keep track of _buyback status
    bool public _buyback = false;

    // _paused is used to pause the contract in case of an emergency
    bool public _paused = true;

    // boolean to keep track of whether presale started or not
    bool public presaleStarted = true;

    /**
     * @dev getReferral shows the msg.sender referral addresss
     */
    function getReferral(address user) public view returns (address) {
        return Referral[user];
    }

    /**
     * @dev setReferral set the msg.sender referral addresss
     */
    function setReferral(address val) public {
        require(val != msg.sender, "you cant be your referral");
        Referral[msg.sender] = val;
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
     * @dev setPaused makes the contract paused or unpaused
     */
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    /**
     * @dev setReferral set the msg.sender referral addresss
     */
    function setRoyalTax(uint256 val) public {
        royaltyFee = val;
    }

    /**
     * @dev setBuyBack sets the buyback status.
     */
    function setBuyBack(bool val) public onlyOwner {
        _buyback = val;
    }

    modifier canBuyBack() {
        require(_buyback, "Buyback is not active");
        _;
    }

    modifier canPresale() {
        require(presaleStarted, "Presale has not ended yet");
        _;
    }

    modifier onlyWhenNotPaused() {
        require(_paused, "Contract currently paused");
        _;
    }
}
