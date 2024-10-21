import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";
import { describe } from "mocha";

describe("Voting contract - voter registration", function() {
    let votingContract: Contract;
    let chairperson: SignerWithAddress;
    let accounts: SignerWithAddress[];

    this.beforeEach(async function () {
        accounts = await ethers.getSigners();
        chairperson = accounts[0];

        const votingFactory = await ethers.getContractFactory("Voting", chairperson);
        votingContract = await votingFactory.deploy(["Proposal 1"]);

    });

    it("Should allow chairperson to register a voter", async function() {
        const voter = accounts[1].address;

        await votingContract.register(voter);
        const voterData = await votingContract.voters(voter);

        expect(voterData.registered).to.be.true;
    });

    it("Should not allow a non-person account to register a voter", async function() {
        const voter = accounts[1].address;

        await expect(
            votingContract.connect(accounts[1]).register(voter))
            .to.be.revertedWith("Only chairperson can call this function");
    });

    it("Should not allow register a voter more than once", async function() {
        const voter = accounts[1].address;

        await votingContract.register(voter);
        await expect(votingContract.register(voter)).to.be.revertedWith("Voter already registered");
    });
});
