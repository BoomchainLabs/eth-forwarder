// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract EthForwarder {
    address payable public recipient;

    event Forwarded(address indexed from, uint256 amount);

    constructor(address payable _recipient) {
        require(_recipient != address(0), "Invalid recipient");
        recipient = _recipient;
    }

    receive() external payable {
        forwardETH();
    }

    fallback() external payable {
        forwardETH();
    }

    function forwardETH() internal {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool sent, ) = recipient.call{value: balance}("");
            require(sent, "Forward failed");
            emit Forwarded(msg.sender, balance);
        }
    }

    function changeRecipient(address payable _newRecipient) external {
        recipient = _newRecipient;
    }
}
