pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
  //state variable (stored on the blockchain)
  string  public name = "DApp Token Farm";     //solidity is staticaly typed (you have to tell sol the type)
  address public owner;

  DappToken public dappToken;
  DaiToken  public daiToken;

  address[] public stakers;
  mapping(address => uint) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;

  constructor(DappToken _dappToken, DaiToken _daiToken) public {
    //runs once when the contract is deployed to the network
    dappToken = _dappToken;
    daiToken  = _daiToken;
    owner = msg.sender;
  }

  //1. Stakes Token      (Deposit)
  function stakeTokens(uint _amount) public {
    //require amount greater than 0
    require(_amount > 0, "amount cannot be 0");

    //Transfer Mock DAI to this contract for Unstaking
    daiToken.transferFrom(msg.sender, address(this), _amount);

    //Update staking balance
    stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

    // Add user to stakers array *only* if they haven't staked already
    if(!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }

    isStaking[msg.sender] = true;
    hasStaked[msg.sender] = true;
  }

  //2. Issue Tokens
  function issueTokens() public {
    // Only Owner can call this function
    require(msg.sender == owner, "caller must be the owner");

    // Issue tokens to all stakers
    for (uint i=0; i<stakers.length; i++)
    {
      address recipient = stakers[i];
      uint balance = stakingBalance[recipient];

      if(balance > 0) {
        dappToken.transfer(recipient, balance);
      }
    }
  }

  //3. Unstaking tokens  (Withdraw)
  function unstakeTokens() public {
    //Fetch staking balanceOf
    uint balance = stakingBalance[msg.sender];

    //Require amount greater than 0
    require(balance > 0, "staking balance cannot be 0");

    //TransferMock Dai tokens to this contract
    daiToken.transfer(msg.sender, balance);

    //Reset staking balance
    stakingBalance[msg.sender] = 0;

    //update staking status
    isStaking[msg.sender] = false;
  }
}
