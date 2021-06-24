pragma solidity ^0.5.0;
import './ERC721Full.sol';

contract DataValidate is ERC721Full {
    string[] public dataValidateTransactionDetails;
    mapping(string => bool) _dataValidateDetailExists;

    constructor() ERC721Full("DataValidate", "DATAVALIDATE") public{     
    }

    function mint(string memory _dataValidateTransactionDetail) public {
        require(!_dataValidateDetailExists[_dataValidateTransactionDetail]);
        uint _id = dataValidateTransactionDetails.push(_dataValidateTransactionDetail);
        _mint(msg.sender, _id);
        _dataValidateDetailExists[_dataValidateTransactionDetail] = true;
    }
}