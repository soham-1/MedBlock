$('title').load('common/title.html');
$('#navbar-holder').load('common/login_navbar.html');

connect();

function login(){

    publicKey = web3.currentProvider.selectedAddress;
    console.log(publicKey);
    contractInstance.get_patient_list(function(error, result){
        if(!error){
            var PatientList = result;
            for(var i = 0; i < PatientList.length; i++) {
                if (publicKey.toLowerCase() == PatientList[i]) {
                    location.href = "./patient/patient_profile.html";
                }
            }
        } else {
            console.log("error in get patient list");
            console.log(error);
        }
    });

    contractInstance.get_doctor_list(function(error, result){
        if(!error){
            var DoctorList = result;
            for(var i = 0; i < DoctorList.length; i++) {
                if (publicKey.toLowerCase() == DoctorList[i]) {
                    location.href = "./doctor_profile.html";
                    user_found = true;
                }
            }
        } else {
            console.log("error in get doctor list");
            console.log(error);
        }
    });
    contractInstance.get_insurer_list(function(error, result){
        if(!error){
            var InsurerList = result;
            for(var i = 0; i < InsurerList.length; i++) {
                if (publicKey.toLowerCase() == InsurerList[i]) {
                    location.href = "./insurer.html?key=" + publicKey;
                    user_found = true;
                }
            }

        } else {
            console.log(error);
            $(".alert-warning").show();
        }
    });
}


function addAgent(){
    var ipfs = window.IpfsApi('localhost', '5001')

    const Buffer = window.IpfsApi().Buffer;

    name1 = $("#name").val();
    age = $("#age").val();

    designation = $("#designation").val();
    designation = parseInt(designation);

    publicKey = web3.currentProvider.selectedAddress;
    publicKey = publicKey.toLowerCase();
    console.log("PK:"+publicKey);

    var validPublicKey = true;
    var validAgent = true;
    var PatientList = 0;
    var DoctorList = 0;
    var InsurerList = 0;

    contractInstance.get_patient_list({gas: 1000000},function(error, result){
        if(!error)
            PatientList = result;
        else {
            console.log("error in get patient list");
            console.error(error);
        }
    });

    contractInstance.get_doctor_list({gas: 1000000},function(error, result){
        if(!error)
            DoctorList = result;
        else {
            console.log("error in get doctor list");
            console.error(error);
        }
    });

    // contractInstance.get_insurer_list({gas: 1000000},function(error, result){
    //     if(!error)
    //         InsurerList = result;
    //     else
    //         console.error(error);
    //     });

    if (validPublicKey == false) {
        alert('public key not valid !');
    }
    else {
        for(j = 0; j < PatientList.length; j++) {
                if (publicKey == PatientList[j] ){
                    validAgent = false;
            }
        }
        for(j = 0; j < DoctorList.length; j++) {
                if (publicKey == DoctorList[j] ){
                    validAgent = false;
            }
        }
        for(j = 0; j < InsurerList.length; j++) {
                if (publicKey == InsurerList[j] ){
                    validAgent = false;
            }
        }
        console.log("is agent valid ? " + validAgent);
        if (validAgent == true) {


            if (designation == "0") {
                const reader = new FileReader();
                const photo = document.getElementById("policy_file");
                reader.readAsArrayBuffer(photo.files[0]);

            reader.onloadend = function() {
                var buffer = Buffer(reader.result);

            ipfs.files.add(buffer, (error, result) => {
                if(error){
                    console.log(error);
                }else{
                    console.log("result: "+result)
                    ipfshash = result[0].hash;
                    console.log("Ipfs hash: "+ipfshash);
                    contractInstance.add_agent(name1, age, designation, ipfshash, {gas: 1000000}, (err, res) => {
                        if(!err){
                            location.replace("./patient/patient_profile.html");
                        }else{
                            console.log(err);
                        }

                    })
                }
            })
        }
    }
    else {
        const reader = new FileReader();
                const photo = document.getElementById("policy_file");
                reader.readAsArrayBuffer(photo.files[0]);

            reader.onloadend = function() {
                var buffer = Buffer(reader.result);

            ipfs.files.add(buffer, (error, result) => {
                if(error){
                    console.log(error);
                }else{
                    console.log("result: "+result)
                    ipfshash = result[0].hash;
                    console.log("Ipfs hash: "+ipfshash);
                    contractInstance.add_agent(name1, age, designation, ipfshash, {gas: 1000000}, (err, res) => {
                        if (!err) {
                            if (designation == "1") {
                                location.replace("./doctor_profile.html");
                            }
        
                        } else
                            console.log(err);
                        });
                }
            })
        }
               
        }
    } else {
            $(".alert-info").show();
        }

    }
    return false;
}