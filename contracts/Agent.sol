pragma solidity ^0.5.1;
pragma experimental ABIEncoderV2;

contract Agent {

    struct patient {
        string name;
        uint age;
        address[] doctorAccessList;
        uint[] diagnosis;
        string record;
        string[] file_name;
        string[] file_hash;
    }

    struct doctor {
        string name;
        uint age;
        address[] patientAccessList;
    }
    struct insurer {
        string name;
        address [] clientlist;
        string email;
    }

    uint creditPool;

    address[] public patientList;
    address[] public doctorList;
    address[] public insurerlist;

    mapping (address => patient) patientInfo;
    mapping (address => doctor) doctorInfo;
    mapping (address => address) Empty;
    mapping (address => insurer) insurerInfo;
    // might not be necessary
    mapping (address => string) patientRecords;



    function add_agent(string memory _name, uint _age, uint _designation, string memory _hash) public returns(string memory){
        address addr = msg.sender;

        if(_designation == 0){
            patient memory p;
            p.name = _name;
            p.age = _age;
            p.record = _hash;
            patientInfo[msg.sender] = p;
            patientList.push(addr)-1;
            return _name;
        }
       else if (_designation == 1){
            doctorInfo[addr].name = _name;
            doctorInfo[addr].age = _age;
            doctorList.push(addr)-1;
            return _name;
       }
       else{
           revert();
       }
    }
    function add_insurer(string memory _name, string memory _email) public returns(string memory){
        address addr = msg.sender;
            insurer memory p;
            p.name = _name;
            p.email = _email;
            insurerInfo[msg.sender] = p;
            insurerlist.push(addr)-1;
            return _name;

    }


    function get_patient(address addr) view public returns (string memory , uint, uint[] memory , address, string memory ){
        // if(keccak256(patientInfo[addr].name) == keccak256(""))revert();
        return (patientInfo[addr].name, patientInfo[addr].age, patientInfo[addr].diagnosis, Empty[addr], patientInfo[addr].record);
    }
    function get_insurer(address addr) view public returns (string memory , string memory){
        // if(keccak256(patientInfo[addr].name) == keccak256(""))revert();
        return (insurerInfo[addr].name, insurerInfo[addr].email);
    }

    function get_doctor(address addr) view public returns (string memory , uint){
        // if(keccak256(doctorInfo[addr].name)==keccak256(""))revert();
        return (doctorInfo[addr].name, doctorInfo[addr].age);
    }
    function get_patient_doctor_name(address paddr, address daddr) view public returns (string memory , string memory ){
        return (patientInfo[paddr].name,doctorInfo[daddr].name);
    }

    function permit_access(address addr) payable public {
        require(msg.value == 2 ether);

        creditPool += 2;

        doctorInfo[addr].patientAccessList.push(msg.sender)-1;
        patientInfo[msg.sender].doctorAccessList.push(addr)-1;

    }


    //must be called by doctor
    function insurance_claim(address paddr, uint _diagnosis, string memory  _hash) public {
        bool patientFound = false;
        for(uint i = 0;i<doctorInfo[msg.sender].patientAccessList.length;i++){
            if(doctorInfo[msg.sender].patientAccessList[i]==paddr){
                msg.sender.transfer(2 ether);
                creditPool -= 2;
                patientFound = true;

            }

        }
        if(patientFound==true){
            set_hash(paddr, _hash);
            remove_patient(paddr, msg.sender);
        }else {
            revert();
        }

        bool DiagnosisFound = false;
        for(uint j = 0; j < patientInfo[paddr].diagnosis.length;j++){
            if(patientInfo[paddr].diagnosis[j] == _diagnosis)DiagnosisFound = true;
        }
    }

    function remove_element_in_array(address[] storage Array, address addr) internal returns(uint)
    {
        bool check = false;
        uint del_index = 0;
        for(uint i = 0; i<Array.length; i++){
            if(Array[i] == addr){
                check = true;
                del_index = i;
            }
        }
        if(!check) revert();
        else{
            if(Array.length == 1){
                delete Array[del_index];
            }
            else {
                Array[del_index] = Array[Array.length - 1];
                delete Array[Array.length - 1];

            }
            Array.length--;
        }
    }

    function remove_patient(address paddr, address daddr) public {
        remove_element_in_array(doctorInfo[daddr].patientAccessList, paddr);
        remove_element_in_array(patientInfo[paddr].doctorAccessList, daddr);
    }

    function get_accessed_doctorlist_for_patient(address addr) public view returns (address[] memory )
    {
        address[] storage doctoraddr = patientInfo[addr].doctorAccessList;
        return doctoraddr;
    }
    function get_accessed_patientlist_for_doctor(address addr) public view returns (address[] memory )
    {
        return doctorInfo[addr].patientAccessList;
    }


    function revoke_access(address daddr) public payable{
        remove_patient(msg.sender,daddr);
        msg.sender.transfer(2 ether);
        creditPool -= 2;
    }

    function get_patient_list() public view returns(address[] memory ){
        return patientList;
    }

    function get_doctor_list() public view returns(address[] memory ){
        return doctorList;
    }
    function get_insurer_list() public view returns(address[] memory ){
        return insurerlist;
    }


    function get_hash(address paddr) public view returns(string memory ){
        return patientInfo[paddr].record;
    }

    function set_hash(address paddr, string memory _hash) internal {
        patientInfo[paddr].record = _hash;
    }

    function add_file_hash(address patient_address, string memory _name, string memory _hash) public {
        patientInfo[patient_address].file_hash.push(_hash)-1;
        patientInfo[patient_address].file_name.push(_name)-1;
    }

    function get_total_patient_files(address padd) public returns (uint) {
        return patientInfo[padd].file_name.length;
    }

    function get_file_from_index(address padd, uint _index) public returns (string memory, string memory) {
        return (patientInfo[padd].file_name[_index], patientInfo[padd].file_hash[_index]);
    }

}