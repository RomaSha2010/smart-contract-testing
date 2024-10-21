1. [Subtask 1.1](#subtask-11)
      1. [Bug 1 - Not covered equal number of votes for `winningProposal` function](#bug-1---not-covered-equal-number-of-votes-for-winningproposal-function)
      2. [Bug 2 - Lack of gas optimization for `winningProposal` function](#bug-2---lack-of-gas-optimization-for-winningproposal-function)
      3. [Bug 3 - The `register` function does not generate an event when a voter is registered](#bug-3---the-register-function-does-not-generate-an-event-when-a-voter-is-registered)
      4. [Bug 4 - No proposal description length limitation](#bug-4---no-proposal-description-length-limitation)
      5. [Vulnerability 1 - Registration Re-entrancy risk](#vulnerability-1---registration-re-entrancy-risk)
      6. [Vulnerability 2 - No protection against sybil attacks](#vulnerability-2---no-protection-against-sybil-attacks)
      7. [Vulnerability 3 - Voting is not limited in time](#vulnerability-3---voting-is-not-limited-in-time)
      8. [Vulnerability 4 - Chairperson Power Centralization](#vulnerability-4---chairperson-power-centralization)
2. [Subtask 1.2](#subtask-12)
      1. [Functionality: Testing Voter Registration](#functionality-testing-voter-registration)
      2. [Functionality: Testing Voting Process](#functionality-testing-voting-process)
      3. [Functionality: Testing Winning Proposal Calculation](#functionality-testing-winning-proposal-calculation)
      4. [Functionality: Testing Proposal Initialization](#functionality-testing-proposal-initialization)
      5. [Functionality: Testing Access Control](#functionality-testing-access-control)
      6. [Functionality: Testing Winner Name Retrieval](#functionality-testing-winner-name-retrieval)
3. [Subtask 1.3](#subtask-13)

<br>

# Subtask 1.1
*1.1 Identify the bug(s) or vulnerability(ies) in the code, explain its impact and propose the right solution.*
 


### Bug 1 - Not covered equal number of votes for `winningProposal` function
 The current logic in the `winningProposal` function does not handle the case where there is a parity in the vote count for proposals. 
 When two proposals have the same `voteCount`, the function will return the last one iterated over. This may result in unexpected or incorrect outcomes when multiple proposals have the same number of votes.

 **Impact**: In case of a tie, the contract will always return the last proposal with the highest vote count, potentially leading to an unfair outcome. Voters and stakeholders may expect a different resolution in case of a tie (for instance - no winner, both being winners ets.).

**Solution**: To resolve this, the function should be modified to handle tied votes appropriately. For instance, I would consider:

* Implement a mechanism to return all proposals with the highest vote count and rework the logic how the winner should be determined - the requirements should give an answer to this question.
* Implement a tiebreaker logic - e.g. random factor or anything else considering project details what can impact to find the winner fairly.


### Bug 2 - Lack of gas optimization for `winningProposal` function
The `winningProposal` function iterates through all proposals each time it is called. This might become a gas issue if there are a large number of proposals.

**Impact**: For a large number of proposals, repeatedly iterating through all of them will consume more gas, potentially causing the function to run out of gas in some scenarios.

**Solution**: To mitigate this, we can optimize by saving and updating the winning proposal as votes are given in the `vote` function. This would avoid the need to iterate through all proposals every time someone queries the winner. In this way I would offer to track the winner dynamically.

### Bug 3 - The `register` function does not generate an event when a voter is registered
Events are important in Solidity to provide transparency, allowing external systems to track contract activity.

**Impact**: Without events, it is harder to track voter registrations via external tools like blockchain explorers.

**Solution**: Add an event for when voters are registered, so external observers can track registration activity.

### Bug 4 - No proposal description length limitation
There is no validation or restriction on the length of proposal descriptions. If a user submits a proposal with an extremely long description, it could result in high gas costs.

**Impact**: This could increase gas usage with no need and make interactions with the contract more expensive.

**Solution**: Add a check to limit the length of proposal descriptions.


### Vulnerability 1 - Registration Re-entrancy risk
The `register` function allows the chairperson to register voters. There is no re-entrancy vulnerability in the code directly, but the `onlyChairperson` modifier should be used with careful attention to avoid calling contracts that might execute re-entrancy. While no external calls are made in the current contract version, this could be an area of potential vulnerability in future extensions.

**Impact**: If external calls were introduced, a re-entrancy attack might be possible, leading to multiple registrations or other inconsistencies.

**Solution**: If future versions of the contract are extended to include external calls we can consider:
* In functions where an external call is made, always update the contract’s internal state before making the external call.
* Solidity provides a built-in modifier called `nonReentrant` from the OpenZeppelin library. It prevents re-entrancy by locking the contract during execution of a function, ensuring that no other call can re-enter the same function until it completes.


###  Vulnerability 2 - No protection against sybil attacks
The contract does not currently prevent a Sybil attack, where someone could create multiple Ethereum addresses and get registered as a voter multiple times. There is no identity verification mechanism beyond the registration done by the chairperson.

**Impact**: An attacker can register multiple addresses, thus casting multiple votes and changing the voting results.

**Solution**: To overcome this threat we can use:
* User verification (KYC – "Know Your Customer")
* Requiring a certain amount of assets to be stored on the address
* Integrate decentralized identity mechanisms or reputation systems

###  Vulnerability 3 - Voting is not limited in time
The contract lacks any mechanism to enforce a defined time window for when voting can start and end. Currently, voting can continue indefinitely unless manually controlled. Without a voting period, there is no guarantee that votes are cast within a fair and reasonable time frame.

**Impact**: If no time limits are imposed, the voting process could be left open indefinitely, which might compromise the fairness of the vote. Without a clear voting period, some participants may not understand when voting ends.

**Solution**: Introduce `start` and `end` for the voting period. This way, voting is only allowed within a defined time window.

###  Vulnerability 4 - Chairperson Power Centralization
The contract gives the chairperson centralized control over key aspects of the voting process, including registering voters. There is no mechanism to prevent the chairperson from abusing this power, such as by selectively registering voters, refusing legitimate registrations, or otherwise manipulating the process.

**Impact**: The centralization of power can compromise the fairness and decentralization of the voting system. The chairperson has unchecked authority, which might lead to a system where voting is distorted or controlled by a single person, what contradicts to the goals of decentralization.

**Solution**: To overcome this vulnerability we can use next options:
* Multisignature Contracts (Multisig): Require multiple trusted individuals (not just the chairperson) to approve actions like registering voters. This prevents a single person from concentrating the power. We can specify a group of trusted members.
* Allow voters to register themselves under certain conditions, such as token staking or decentralized identity solutions



# <br>Subtask 1.2
*1.2 Identify the functionalities under testing and give a brief description of what will be
verified. Identify also edge cases.*</p>


### Functionality: Testing Voter Registration

**TC1: Voter Registration by Chairperson:** Verify that only the chairperson can register voters. Ensure that other addresses attempting to register voters are rejected.

**Edge Case 1:** Attempt to register the same voter twice and ensure the contract reverts with the correct error message ("Voter already registered").

**TC2: Voter Registration Status:** Verify that after a voter is registered, their status (registered) is correctly set to true in the contract.

**Edge Case 2:** Test with a voter who was not registered and verify that their status remains false.


### Functionality: Testing Voting Process

**TC3: Registered Voter Can Vote:** Verify that a registered voter can cast their vote on a valid proposal.

**Edge Case 3:** Try voting twice from the same voter address and ensure the contract reverts with "Already voted".

**TC4: Invalid Proposal Voting:** Verify that the contract reverts when a voter attempts to vote for a non-existent proposal (index out of bounds).

**TC5: Unregistered Voter Cannot Vote:** Verify that a voter who has not been registered cannot vote and ensure the contract reverts with "Voter is not registered".

**Edge Case 5:** Test an unregistered voter trying to vote after the vote has been cast by another user to ensure their vote is still rejected.


### Functionality: Testing Winning Proposal Calculation

**TC6: Winning Proposal Calculation:** Verify that the winningProposal function returns the correct proposal index with the highest vote count.

**Edge Case 6:** If multiple proposals have the same highest vote count, verify that the function returns the index of the last proposal iterated over (based on the current contract logic).


### Functionality: Testing Proposal Initialization

**TC7: Proposal Count Validation:** Verify that the number of initialized proposals matches the number provided during contract deployment.

**Edge Case 7:** Ensure that if no proposals are provided during deployment, the contract fails to initialize correctly (depending on how the constructor is designed to handle this).


### Functionality: Testing Access Control

**TC8: Chairperson-Only Access:** Verify that only the chairperson can call functions like register for voter registration.

**Edge Case 8:** Attempt to register voters or perform chairperson actions from an address other than the chairperson, and ensure the contract reverts with "Only chairperson can call this function".


### Functionality: Testing Winner Name Retrieval

**TC9: Winner Name Retrieval:** Verify that the winnerName function returns the correct proposal description for the winning proposal index.

**Edge Case 9:** Ensure that if the voting ends with no votes cast, the winnerName function returns the description of the first proposal (depending on contract logic) or throws an error if no voting has occurred.


# <br>Subtask 1.3
*1.3 If you had to choose a framework to write the test cases identified previously, which one would you choose and why?*</p>

**Recommended Framework: Hardhat**

- Provides a complete development environment for Ethereum-based smart contracts including Solidity compilation, deployment, and automated testing. Supports TypeScript and JavaScript
- Natively integrates with ethers.js
- Nice API for interaction with smart contracts
- Easy to deploy contracts, call functions, and simulate different scenarios
- Automatic connection to a local Ethereum node for testing and debugging
- Supports writing tests using Mocha (a popular JavaScript test runner) and Chai (an assertion library)

Also, I would consider Waffle as addtion to Hardhat. This is a specialized library used for writing, testing, and mocking smart contracts in JavaScript or TypeScript. It provides specialized matchers for testing smart contracts, which make writing tests more intuitive.

This setup provides the best of both worlds: a comprehensive development environment (Hardhat) and expressive, custom matchers for contract testing (Waffle).