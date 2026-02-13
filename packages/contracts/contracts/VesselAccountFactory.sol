// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@account-abstraction/contracts/accounts/SimpleAccountFactory.sol";

contract VesselAccountFactory is SimpleAccountFactory {
    constructor(IEntryPoint _entryPoint) SimpleAccountFactory(_entryPoint) {}
}
