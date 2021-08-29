
// if (typeof web3 !== 'undefined') {
//     web3 = new Web3(web3.currentProvider);
// } else {
//     // set the provider you want from Web3.providers
// web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
// }

var web3;

var agentContractAddress = '0x3A1FBDc73065bAF267D2B6491DA4E8eEC93623Bd';
//var agentContractAddress = '0x907535197050436D1e71102a4271110e83BeE453';


function connect(){
    web3 = new Web3(window.ethereum)
    window.ethereum.enable().catch(error => {
        // User denied account access
        console.log(error);
    })
    abi = JSON.parse(`[
        {
            "constant":true,
            "inputs":[{"name":"addr","type":"address"}],
            "name":"get_accessed_doctorlist_for_patient",
            "outputs":[{"name":"","type":"address[]"}],
            "payable":false,
            "stateMutability":"view",
            "type":"function"},
        {
            "constant":false,
            "inputs":[{"name":"paddr","type":"address"},
            {"name":"daddr","type":"address"}],
            "name":"remove_patient",
            "outputs":[],
            "payable":false,
            "stateMutability":"nonpayable",
            "type":"function"
        },
        {
            "constant":true,
            "inputs":[{"name":"","type":"uint256"}],
            "name":"doctorList",
            "outputs":[{"name":"","type":"address"}],
            "payable":false,
            "stateMutability":"view",
            "type":"function"
        },
        {
            "constant":true,
            "inputs":[{"name":"paddr","type":"address"},{"name":"daddr","type":"address"}],
            "name":"get_patient_doctor_name",
            "outputs":[{"name":"","type":"string"},{"name":"","type":"string"}],
            "payable":false,
            "stateMutability":"view",
            "type":"function"
        },
        {
            "constant":false,
            "inputs":[{"name":"daddr","type":"address"}],
            "name":"revoke_access",
            "outputs":[],
            "payable":true,
            "stateMutability":"payable",
            "type":"function"
        },
        {
            "constant":true,
            "inputs":[{"name":"addr","type":"address"}],
            "name":"get_patient",
            "outputs":[{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256[]"},{"name":"","type":"address"},{"name":"","type":"string"}],
            "payable":false,
            "stateMutability":"view",
            "type":"function"
        },
        {"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"get_doctor","outputs":[{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"insurerList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[{"name":"paddr","type":"address"}],"name":"get_hash","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"get_insurer","outputs":[{"name":"name","type":"string"},{"name":"email","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":false,"inputs":[{"name":"paddr","type":"address"}],"name":"accept_claim","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},
        {"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"patientList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"permit_access","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},
        {"constant":true,"inputs":[],"name":"get_doctor_list","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":false,"inputs":[{"name":"iaddr","type":"address"},{"name":"_diagnosis","type":"uint256[]"}],"name":"select_insurer","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},
        {"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"get_accessed_patientlist_for_doctor","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[],"name":"get_patient_list","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":true,"inputs":[],"name":"get_insurer_list","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},
        {"constant":false,"inputs":[{"name":"_name","type":"string"},{"name":"_age","type":"uint256"},{"name":"_designation","type":"uint256"},{"name":"_hash","type":"string"}],"name":"add_agent","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
        {"constant":false,"inputs":[{"name":"paddr","type":"address"},{"name":"_diagnosis","type":"uint256"},{"name":"_hash","type":"string"}],"name":"insurance_claim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
        {"constant":false,"inputs":[{"name":"name","type":"string"},{"name":"email","type":"string"}],"name":"add_insurer","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
        {
            "constant": false,
            "inputs": [
                {
                    "name": "patient_address",
                    "type": "address"
                },
                {
                    "name": "_name",
                    "type": "string"
                },
                {
                    "name": "_hash",
                    "type": "string"
                }
            ],
            "name": "add_file_hash",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "padd",
                    "type": "address"
                }
            ],
            "name": "get_total_patient_files",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "padd",
                    "type": "address"
                },
                {
                    "name": "_index",
                    "type": "uint256"
                }
            ],
            "name": "get_file_from_index",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                },
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_title",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "_amount_cover",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "_policy_detail",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_policy_image",
                    "type": "string"
                }
            ],
            "name": "add_policy",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "addr",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "client",
                    "type": "address"
                }
            ],
            "name": "add_policy_client",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "addr",
                    "type": "address"
                }
            ],
            "name": "client_policy_list",
            "outputs": [
                {
                    "internalType": "address[]",
                    "name": "",
                    "type": "address[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "internalType": "address",
                    "name": "addr",
                    "type": "address"
                }
            ],
            "name": "get_policy",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "amount_cover",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ]`);
    AgentContract = web3.eth.contract(abi);
    contractInstance = AgentContract.at(agentContractAddress);
    web3.eth.defaultAccount = web3.currentProvider.selectedAddress;
    console.log("Web3 Connected:"+ web3.eth.defaultAccount );
    return web3.currentProvider.selectedAddress;
}

window.addEventListener('load', async () => {
    // New web3 provider
    connect();
    console.log("Externally Loaded!");
});