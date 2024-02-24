// Hardhat & Test
import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

// Types
import { BBKIsERC20 } from "../typechain-types";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// Whitelisted addresses
import { whitelisted } from "../utils/whitelisted";

describe("BBKIsERC20 Tests", function () {
  let contract: BBKIsERC20;

  let owner: SignerWithAddress; // whitelisted
  let addr1: SignerWithAddress; // whitelisted
  let addr2: SignerWithAddress; // NOT whitelisted

  let merkleTree: StandardMerkleTree<string[]>

  async function deployContractFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    merkleTree = StandardMerkleTree.of(whitelisted, ["address"], { sortLeaves: true });

    const contractFactory = await ethers.getContractFactory("BBKIsERC20");
    const contract = await contractFactory.deploy(owner.address, merkleTree.root);

    return {contract, merkleTree, owner, addr1, addr2 };
  }

  // Deployment
  describe("Deployment", function () {
    it('should deploy the smart contract', async function() {
      const { contract, merkleTree, owner, addr1, addr2 } = await loadFixture(deployContractFixture);
      let contractMerkleTree = await contract.merkleRoot();
      assert(contractMerkleTree === merkleTree.root);
      let contractOwner = await contract.owner();
      assert(contractOwner === owner.address);
    })
  });

  // Mint
  describe("Mint", function() {
    it('should NOT mint if NOT whitelisted | @openzeppelin/merkle-tree library Test', async function() {
      const { contract, merkleTree, owner, addr1, addr2 } = await loadFixture(deployContractFixture);
      try {
        const proof = merkleTree.getProof([addr2.address]);
        expect.fail("Expected an error 'Error: Leaf is not in tree' but none was thrown.");
      } catch (error) {
        // Assertion de type pour que TypeScript traite `error` comme une instance de `Error`
        const err = error as Error;
        expect(err.message).to.include("Leaf is not in tree");
      }
    })

    it('should NOT mint if NOT whitelisted | contract Test', async function() {
      const { contract, merkleTree, owner, addr1, addr2 } = await loadFixture(deployContractFixture);
      const proof: string[] = [];
      await expect(contract.connect(addr2).mint(addr2.address, proof)).to.be.revertedWith('Not Whitelisted');
    })

    it('should NOT mint tokens if tokens already minted', async function() {
      const { contract, merkleTree, owner, addr1, addr2 } = await loadFixture(deployContractFixture);
      const proof = merkleTree.getProof([addr1.address]);

      await contract.connect(addr1).mint(addr1.address, proof)

      await expect(contract.connect(addr1).mint(addr1.address, proof)).to.be.revertedWith('Tokens already minted');
    })

    it('should mint tokens if the user is whitelisted and has not minted yet', async function() {
      const { contract, merkleTree, owner, addr1, addr2 } = await loadFixture(deployContractFixture);
      const proof = merkleTree.getProof([addr1.address]);

      await contract.connect(addr1).mint(addr1.address, proof)

      let balance = await contract.balanceOf(addr1.address);
      let expectedBalance = ethers.parseEther('2');

      assert(balance === expectedBalance)
    })
  })

  // Set Merkle Root
  describe('setMerkleRoot', function() {
    it('should NOT set the merkle root if the caller is NOT the owner', async function() {
      const { contract, merkleTree, owner, addr1, addr2 } = await loadFixture(deployContractFixture);

      await expect(contract.connect(addr1).setMerkleRoot(merkleTree.root)).to.be.revertedWithCustomError(
        contract,
        'OwnableUnauthorizedAccount'
      ).withArgs(
        addr1.address
      )
    })

    it('should set the merkle root if the caller is the owner', async function() {
      const { contract, merkleTree, owner, addr1, addr2 } = await loadFixture(deployContractFixture);
      let newMerkleRoot = "0xd1000e3d5650743475aa0addfeef7e36cbfc4e060939615f4c3651e4b529d61c";
      await contract.setMerkleRoot(newMerkleRoot);

      let contractMerkleRoot = await contract.merkleRoot()
      assert(newMerkleRoot === contractMerkleRoot);

    })
  })
});
