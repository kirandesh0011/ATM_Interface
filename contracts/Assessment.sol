// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public investmentAmount;
    uint256 public investmentReturn;
    uint256 public investmentTime;
    uint256 public investmentGain;
    uint256 public roi;
    uint256 public annualizedROI;
    bool public showTable;
    bool public showDonateOptions;
    string public selectedDonationOption;
    uint256 public donationAmount;
    bool public donationSuccess;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event ROI(uint256 gain, uint256 roi, uint256 annualizedROI);
    event Donation(string option, uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function calculateROI(uint256 _investmentAmount, uint256 _investmentReturn, uint256 _investmentTime) public {
        require(msg.sender == owner, "You are not the owner of this account");
        investmentAmount = _investmentAmount;
        investmentReturn = _investmentReturn;
        investmentTime = _investmentTime;
        uint256 gain = investmentReturn - investmentAmount;
        roi = (gain * 100) / investmentAmount;
        annualizedROI = roi / investmentTime;
        investmentGain = gain;
        showTable = true;
        if (roi >= 50) {
            showDonateOptions = true;
        } 
        emit ROI(gain, roi, annualizedROI);
    }

    function donateMoney(string memory _option, uint256 _amount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(balance >= _amount, "Insufficient balance");
        require(roi >= 50, "ROI is not greater than or equal to 50%");
        
        if (keccak256(abi.encodePacked(_option)) == keccak256(abi.encodePacked("Orphanage"))) {
            require(_amount >= 500, "Minimum donation amount for Orphanage is 500");
        } else if (keccak256(abi.encodePacked(_option)) == keccak256(abi.encodePacked("Old Age Homes"))) {
            require(_amount >= 800, "Minimum donation amount for Old Age Homes is 800");
        }
        
        emit Donation(_option, _amount);
        balance -= _amount;
        donationSuccess = true;
    }
}
