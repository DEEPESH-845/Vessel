// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/StableSwapAMM.sol";

contract StableSwapAMMTest is Test {
    StableSwapAMM public amm;
    ERC20Mock public token0;
    ERC20Mock public token1;
    ERC20Mock public token2;
    ERC20Mock public token3;
    
    address public user1 = address(0x1);
    address public owner = address(this);
    
    function setUp() public {
        token0 = new ERC20Mock("Token0", "T0", 18);
        token1 = new ERC20Mock("Token1", "T1", 18);
        token2 = new ERC20Mock("Token2", "T2", 18);
        token3 = new ERC20Mock("Token3", "T3", 18);
        
        address[4] memory coins = [address(token0), address(token1), address(token2), address(token3)];
        amm = new StableSwapAMM(
            coins,
            "Vessel LP",
            "vLP",
            100,
            3000000
        );
        
        token0.mint(user1, 1000000 ether);
        token1.mint(user1, 1000000 ether);
        token2.mint(user1, 1000000 ether);
        token3.mint(user1, 1000000 ether);
    }
    
    // Test initialization
    function testInitialization() public view {
        assertEq(amm.A(), 100);
        assertEq(amm.fee(), 3000000);
        assertFalse(amm.isPaused());
    }
    
    // Test pause functionality
    function testPause() public {
        vm.prank(owner);
        amm.pause();
        assertTrue(amm.isPaused());
        
        vm.prank(owner);
        amm.unpause();
        assertFalse(amm.isPaused());
    }
    
    // Test pause by non-owner fails
    function testPauseByNonOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        amm.pause();
    }
    
    // Test unpause by non-owner fails
    function testUnpauseByNonOwner() public {
        vm.prank(owner);
        amm.pause();
        
        vm.prank(user1);
        vm.expectRevert();
        amm.unpause();
    }
    
    // Test setFee by owner
    function testSetFee() public {
        vm.prank(owner);
        amm.setFee(5000000);
        assertEq(amm.fee(), 5000000);
    }
    
    // Test setFee by non-owner fails
    function testSetFeeByNonOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        amm.setFee(5000000);
    }
    
    // Test setAdminFee by owner
    function testSetAdminFee() public {
        vm.prank(owner);
        amm.setAdminFee(500000000);
        assertEq(amm.adminFee(), 500000000);
    }
    
    // Test setRateMultiplier by owner
    function testSetRateMultiplier() public {
        vm.prank(owner);
        amm.setRateMultiplier(0, 1e30);
        // Just verify it doesn't revert
    }
    
    // Test exchange reverts for same coin
    function testExchangeRevertsForSameCoin() public {
        vm.startPrank(user1);
        vm.expectRevert("StableSwapAMM: same coin");
        amm.exchange(0, 0, 10 ether, 1);
        vm.stopPrank();
    }
    
    // Test exchange reverts for invalid index
    function testExchangeRevertsForInvalidIndex() public {
        vm.startPrank(user1);
        vm.expectRevert("StableSwapAMM: invalid coin index");
        amm.exchange(0, 10, 10 ether, 1);
        vm.stopPrank();
    }
    
    // Test getBalances returns empty initially
    function testGetBalances() public view {
        uint256[4] memory bals = amm.getBalances();
        assertEq(bals[0], 0);
    }
    
    // Test getVirtualPrice when empty
    function testGetVirtualPriceEmpty() public view {
        assertEq(amm.getVirtualPrice(), 1e18);
    }
}

contract ERC20Mock is ERC20 {
    uint8 private _decimals;
    
    constructor(string memory name, string memory symbol, uint8 decimals_) ERC20(name, symbol) {
        _decimals = decimals_;
    }
    
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
