// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./Team.sol";

contract Factory{
     uint count;
     Team[] public teams;
  	 string[] public names;

    event TeamCreated(address TeamAddress);

    modifier hasTeams {
        require(teams.length==0, "No team yet");
        _;
    }

    function createTeam(string memory name, string[] memory _nicks, string[] memory _avatars, address payable [] memory _addresses, uint8[] memory _shares) public returns (address){
       names.push(name);
       Team team = new Team(_nicks,_avatars,_addresses,_shares);
       teams.push(team);
       count++;
       emit TeamCreated(address(team));
       return address(team);
     }
     
     function getAddress() external view returns(address){
       return address(this);
     }

     function getTeams() external view returns(Team[] memory _teams){
       return teams;
     }
     
     function getCount() external view returns(uint){
       return teams.length;
     }
     
     function getTeamAddress(uint _index) external view returns(address){
       return address(teams[_index]);
     }  
 
}