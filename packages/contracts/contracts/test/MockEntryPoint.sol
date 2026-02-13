// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockEntryPoint {
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return true;
    }

    function depositTo(address account) external payable {}
    function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount) external {}
    function addStake(uint32 _unstakeDelaySec) external payable {}
    function unlockStake() external {}
    function withdrawStake(address payable withdrawAddress) external {}
    function balanceOf(address account) external view returns (uint256) {
        return 0;
    }
}
