// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {

  string public myString = 'hello world !';

  function setMyString (string memory _myString) public {
    myString = _myString;
  }

  function getMyString() public view returns(string memory){
    return myString;
  }

}