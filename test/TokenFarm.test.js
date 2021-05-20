const DappToken = artifacts.require('DappToken');
const DaiToken  = artifacts.require('DaiToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm

  before(async () => {
    daiToken  = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    //Transfer all dapp to Farm
    await dappToken.transfer(tokenFarm.address, tokens('1000000'))
    //Transfer to insvestor
    await daiToken.transfer(investor, tokens('100'), { from: owner })
  })

  describe('Mock Dai deployment', async() => {
    it('has a name', async() => {
      const name = await daiToken.name()
      assert.equal(name, 'Mock DAI Token')
    })
  })

  describe('Dapp Token deployment', async() => {
    it('has a name', async() => {
      const name = await dappToken.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('Token Farm deployment', async() => {
    it('has a name', async() => {
      const name = await tokenFarm.name()
      assert.equal(name, 'DApp Token Farm')
    })
  })

  it('contract has tokens', async () => {
    let balance = await dappToken.balanceOf(tokenFarm.address)
    assert.equal(balance.toString(), tokens('1000000'))
  })

  describe('Farming Tokens', async () => {
    it('rewards investors for staking mDai tokens', async () => {
      let result

      //Check investor balance before staking
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

      // Stake Mock Dai tokens
      await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
      await tokenFarm.stakeTokens(tokens('100'), { from: investor })

      //check if balance is correct
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

      // check if staking balnace is correct
      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI wallet balance correct after staking')

      result = await tokenFarm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

      result = await tokenFarm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

      //Issue Tokens
      await tokenFarm.issueTokens({ from: owner })

      //Check Balance after issuance
      result = await dappToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct after issuance')

      //Only owner can issue tokens
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected

      //Unstake tokens
      await tokenFarm.unstakeTokens({ from: investor })

      //check results after Unstaking
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')
      
    })
  })
})
