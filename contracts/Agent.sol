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
        string[] bill_name;
        string[] bill_hash;
        address insurer_addr;
        address[] insurerAccessList;
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
        address [] clientAccessList;
    }

    struct policy {
        string title;
        address insurer_addr;
        address [] clientlist;
        uint amount_cover;
        string policy_detail;
        string policy_image;
    }

    uint creditPool;

    address[] public patientList;
    address[] public doctorList;
    address[] public insurerlist;
    policy[] public policyList;

    mapping (address => patient) patientInfo;
    mapping (address => doctor) doctorInfo;
    mapping (address => address) Empty;
    mapping (address => insurer) insurerInfo;
    // might not be necessary
    mapping (address => string) patientRecords;
    mapping (address => policy) policyInfo;



    function add_agent(string memory _name, uint _age, uint _designation, string memory _hash) public returns(string memory){
        address addr = msg.sender;

        if(_designation == 0){
            patient memory p;
            p.name = _name;
            p.age = _age;
            p.record = _hash;
            patientInfo[addr] = p;
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
        function add_policy(string memory _title, uint _amount_cover, string memory _policy_detail, string memory _policy_image) public returns(string memory){
        address addr = msg.sender;
           policy memory p;
            p.title = _title;
            p.insurer_addr = addr;
            p.amount_cover= _amount_cover;
            p.policy_detail= _policy_detail;
            p.policy_image= _policy_image;
            policyInfo[addr]=p;
            policyList.push(p)-1;
            return _title;

    }

    function get_total_policies() public returns (uint) {
        return policyList.length;
    }

    function get_policy_from_index(uint _index) public returns (address, string memory, uint amount_cover, string memory, string memory) {
        return (policyList[_index].insurer_addr, policyList[_index].title, policyList[_index].amount_cover, policyList[_index].policy_detail,  policyList[_index].policy_image);
    }

    function user_exists_in_policy(address add, uint _index) public view returns (bool){
        for(uint i = 0; i < policyList[_index].clientlist.length; i++) {
            if (policyList[_index].clientlist[i] == add) return true;
        }
        return false;
    }

    function get_patient(address addr) view public returns (string memory , uint, uint[] memory , address, string memory ){
        // if(keccak256(patientInfo[addr].name) == keccak256(""))revert();
        return (patientInfo[addr].name, patientInfo[addr].age, patientInfo[addr].diagnosis, Empty[addr], patientInfo[addr].record);
    }
    function get_insurer(address addr) view public returns (string memory , string memory){
        // if(keccak256(patientInfo[addr].name) == keccak256(""))revert();
        return (insurerInfo[addr].name, insurerInfo[addr].email);
    }
    function add_patient_insurer(address addr, address insurer_addr) public{
        patientInfo[addr].insurer_addr=insurer_addr;
        insurerInfo[insurer_addr].clientlist.push(addr) -1;
    }
    function get_patient_insurer(address addr) view public returns(address){
        return patientInfo[addr].insurer_addr;
    }

    function get_doctor(address addr) view public returns (string memory , uint){
        // if(keccak256(doctorInfo[addr].name)==keccak256(""))revert();
        return (doctorInfo[addr].name, doctorInfo[addr].age);
    }
    function get_policy(address addr) view public returns (string memory, uint amount_cover, string memory, string memory){
        // if(keccak256(doctorInfo[addr].name)==keccak256(""))revert();
        return (policyInfo[addr].title, policyInfo[addr].amount_cover, policyInfo[addr].policy_detail,  policyInfo[addr].policy_image);
    }
    function add_policy_client(address key, uint _index)  public{
        policyList[_index].clientlist.push(key)-1;
    }
    function client_policy_list(address addr) view public returns(address[] memory){
        return policyInfo[addr].clientlist;
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
    function permit_access_insurer(address addr) payable public {
        require(msg.value == 2 ether);

        creditPool += 2;

        insurerInfo[addr].clientAccessList.push(msg.sender)-1;
        patientInfo[msg.sender].insurerAccessList.push(addr)-1;

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
    function remove_insurer_acs(address paddr, address iaddr) public {
        remove_element_in_array(insurerInfo[iaddr].clientAccessList, paddr);
        remove_element_in_array(patientInfo[paddr].insurerAccessList, iaddr);
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
    function get_accessed_patientlist_for_insurer(address addr) public view returns (address[] memory)
    {
        return insurerInfo[addr].clientAccessList;
    }

    function revoke_access(address daddr) public payable{
        remove_patient(msg.sender,daddr);
        msg.sender.transfer(2 ether);
        creditPool -= 2;
    }
    function revoke_insurer_access(address iaddr) public payable{
        remove_insurer_acs(msg.sender,iaddr);
        msg.sender.transfer(2 ether);
        creditPool -= 2;
    }

    function revoke_insurer_access_invert(address paddr) public payable{
        remove_insurer_acs(paddr,msg.sender);
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
    function get_accessed_insurerlist_patient(address addr) public view returns(address[] memory){
        return patientInfo[addr].insurerAccessList;
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

    function add_bill_hash(address patient_address, string memory _name, string memory _hash) public {
        patientInfo[patient_address].bill_hash.push(_hash)-1;
        patientInfo[patient_address].bill_name.push(_name)-1;
    }

    function get_total_patient_bills(address padd) public returns (uint) {
        return patientInfo[padd].bill_hash.length;
    }

    function get_bill_from_index(address padd, uint _index) public returns (string memory, string memory) {
        return (patientInfo[padd].bill_name[_index], patientInfo[padd].bill_hash[_index]);
    }

}