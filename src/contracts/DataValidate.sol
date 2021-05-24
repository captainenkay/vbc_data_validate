pragma solidity ^0.5.0;
import './ERC721Full.sol';

contract DataValidate is ERC721Full {
    string[] public dataValidateHashes;
    mapping(string => bool) _dataValidateHashExists;

    constructor() ERC721Full("DataValidate", "DATAVALIDATE") public{     
    }

    function mint(string memory _dataValidateHash) public {
        require(!_dataValidateHashExists[_dataValidateHash]);
        uint _id = dataValidateHashes.push(_dataValidateHash);
        _mint(msg.sender, _id);
        _dataValidateHashExists[_dataValidateHash] = true;
    }
}