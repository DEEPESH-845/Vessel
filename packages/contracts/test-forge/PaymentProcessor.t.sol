// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/PaymentProcessor.sol";

contract PaymentProcessorTest is Test {
    PaymentProcessor public processor;
    ERC20Mock public paymentToken;
    ERC20Mock public settlementToken;
    
    address public owner = address(this);
    address public merchant = address(0x1);
    address public payer = address(0x2);
    address public feeCollector = address(0x3);
    
    bytes32 public merchantId = keccak256("merchant1");
    
    function setUp() public {
        paymentToken = new ERC20Mock("Payment Token", "PAY");
        settlementToken = new ERC20Mock("Settlement Token", "SET");
        
        processor = new PaymentProcessor(feeCollector, 100); // 1% protocol fee
        
        processor.addToken(address(paymentToken));
        processor.addToken(address(settlementToken));
        
        paymentToken.mint(payer, 1000000 ether);
        settlementToken.mint(merchant, 1000000 ether);
    }
    
    // Test initialization
    function testInitialization() public view {
        assertEq(processor.feeCollector(), feeCollector);
        assertEq(processor.protocolFeeBps(), 100);
        assertFalse(processor.isPaused());
    }
    
    // Test merchant registration
    function testRegisterMerchant() public {
        vm.prank(merchant);
        processor.registerMerchant(
            merchantId,
            address(settlementToken),
            200 // 2% merchant fee
        );
        
        (address m, address s, uint256 fee, bool active,) = processor.getMerchantConfig(merchantId);
        
        assertEq(m, merchant);
        assertEq(s, address(settlementToken));
        assertEq(fee, 200);
        assertTrue(active);
    }
    
    // Test pause functionality
    function testPause() public {
        processor.pause();
        assertTrue(processor.isPaused());
        
        processor.unpause();
        assertFalse(processor.isPaused());
    }
    
    // Test pause by non-owner fails
    function testPauseByNonOwner() public {
        vm.prank(merchant);
        vm.expectRevert();
        processor.pause();
    }
    
    // Test unpause by non-owner fails
    function testUnpauseByNonOwner() public {
        processor.pause();
        
        vm.prank(merchant);
        vm.expectRevert();
        processor.unpause();
    }
    
    // Test add token
    function testAddToken() public {
        ERC20Mock newToken = new ERC20Mock("New", "NEW");
        
        processor.addToken(address(newToken));
        assertTrue(processor.acceptedTokens(address(newToken)));
    }
    
    // Test remove token
    function testRemoveToken() public {
        processor.removeToken(address(paymentToken));
        assertFalse(processor.acceptedTokens(address(paymentToken)));
    }
    
    // Test set protocol fee by owner
    function testSetProtocolFee() public {
        processor.setProtocolFee(200);
        assertEq(processor.protocolFeeBps(), 200);
    }
    
    // Test set protocol fee by non-owner fails
    function testSetProtocolFeeByNonOwner() public {
        vm.prank(merchant);
        vm.expectRevert();
        processor.setProtocolFee(200);
    }
    
    // Test set fee collector by owner
    function testSetFeeCollector() public {
        address newCollector = address(0x99);
        processor.setFeeCollector(newCollector);
        assertEq(processor.feeCollector(), newCollector);
    }
    
    // Test update merchant
    function testUpdateMerchant() public {
        vm.prank(merchant);
        processor.registerMerchant(merchantId, address(settlementToken), 200);
        
        vm.prank(merchant);
        processor.updateMerchant(merchantId, address(settlementToken), 300, false);
        
        (,, uint256 fee, bool active,) = processor.getMerchantConfig(merchantId);
        
        assertEq(fee, 300);
        assertFalse(active);
    }
}

contract ERC20Mock is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
