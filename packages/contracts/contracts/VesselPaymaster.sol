// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@account-abstraction/contracts/core/BasePaymaster.sol";
import { _packValidationData } from "@account-abstraction/contracts/core/Helpers.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import { PackedUserOperation } from "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

contract VesselPaymaster is BasePaymaster {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public verifyingSigner;
    uint256 public constant COST_OF_POST = 0; // Simplified for hackathon

    constructor(IEntryPoint _entryPoint, address _verifyingSigner, address _owner) 
        BasePaymaster(_entryPoint) 
    {
        verifyingSigner = _verifyingSigner;
        transferOwnership(_owner);
    }

    function setVerifyingSigner(address _newSigner) external onlyOwner {
        verifyingSigner = _newSigner;
    }

    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal view override returns (bytes memory context, uint256 validationData) {
        // userOp.paymasterAndData: [paymasterAddress(20 bytes)] + [validUntil(6 bytes)] + [validAfter(6 bytes)] + [signature(dynamic)]
        bytes calldata paymasterAndData = userOp.paymasterAndData;
        
        // 1. Check length
        if (paymasterAndData.length < 20 + 6 + 6 + 65) {
            revert("VesselPaymaster: invalid paymasterAndData length");
        }

        // 2. Extract validity window
        uint48 validUntil = uint48(bytes6(paymasterAndData[20:26]));
        uint48 validAfter = uint48(bytes6(paymasterAndData[26:32]));

        // 3. Extract signature
        // signature is everything after the first 32 bytes (20+6+6)
        bytes calldata signature = paymasterAndData[32:];

        // 4. Reconstruct the hash that was signed
        // We sign: keccak256(userOpHash, validUntil, validAfter)
        // This ensures the signature is bound to this specific UserOp and validity window
        bytes32 hash = keccak256(abi.encodePacked(userOpHash, validUntil, validAfter));
        bytes32 ethSignedHash = hash.toEthSignedMessageHash();

        // 5. Recover signer
        address recoveredSigner = ethSignedHash.recover(signature);

        // 6. Verify signer
        if (recoveredSigner != verifyingSigner) {
            return ("", _packValidationData(true, validUntil, validAfter));
        }

        // Return success with time bounds
        return ("", _packValidationData(false, validUntil, validAfter));
    }
}
