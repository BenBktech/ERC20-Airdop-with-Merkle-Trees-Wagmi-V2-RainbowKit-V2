// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract BBKIsERC20 is ERC20, Ownable {

    bytes32 public merkleRoot;
    uint256 private constant MINT_AMOUNT = 2 ether;

    mapping(address => bool) private hasMinted;

    constructor(address _initialOwner, bytes32 _merkleRoot)
        ERC20("Ben BK Token", "BBK")
        Ownable(_initialOwner)
    {
        merkleRoot = _merkleRoot;
    }

    /**
    * @notice Allows a whitelisted user to mint tokens
    *
    * @param _to The token receiver
    * @param _proof The merkle proof
    **/
    function mint(address _to, bytes32[] calldata _proof) external {
        require(isWhitelisted(msg.sender, _proof), "Not Whitelisted");
        require(!hasMinted[msg.sender], "Tokens already minted");
        hasMinted[msg.sender] = true;
        _mint(_to, MINT_AMOUNT);
    }

    /**
    * @notice Change the merkle root
    *
    * @param _merkleRoot the new merkle root
    **/
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    /**
    * @notice Check if an address is whitelisted or not
    * 
    * @param _account The account checked
    * @param _proof The merkle proof
    *
    * @return bool return true if the address is whitelisted, false otherwise
    **/
    function isWhitelisted(address _account, bytes32[] calldata _proof) internal view returns(bool) {
        bytes32 leaf = keccak256(abi.encode(keccak256(abi.encode(_account))));
        return MerkleProof.verify(_proof, merkleRoot, leaf);
    }
}
