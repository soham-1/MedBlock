// $('title').load('common/title.html');
// $('#navbar-holder').load('common/logout_navbar.html', function(){
//     $('.offcanvas-body').load('common/patient_sidebar.html');
//     $('#breadcrumb-holder').load('common/breadcrumb.html', function(){
//         //
//     });
// });
        

var url_string = window.location.href;
var url = new URL(url_string);
var key ;

toggleRecordsButton = 0;
var recordHash = "";

$(window).load(function() {
    connect();
    $("#records").hide();
    $(".alert-info").hide();
    $(".alert-danger").hide();
    key = web3.currentProvider.selectedAddress;
    key = key.toLocaleLowerCase();

    // var ipfs = window.IpfsApi('localhost', '5001')

    const Buffer = window.IpfsApi().Buffer;

    var a = "";
    var b = 0;
    var ailments = [];
    var insurerName = "";

    $("#buyInsurance").hide();
    $("#insuranceInfo").hide();

    // print patient details and insurer details (if exists). If insurer does not exist show the buy insurance panel
    console.log("Getting Patient Data");
    contractInstance.get_patient.call(key, {gas: 1000000}, function(error, result){
        console.log("Patient Data Result:"+result);
        if(!error){
            console.log(result);
            a = result[0];
            b = result[1];
            ailments = result[2];
            insurerAddress = result[3];
            recordHash = result[4];
            $("#name").html(a);
            $("#age").html(b.c[0]);
            $("#recordsHash").html(recordHash);

            if (insurerAddress != 0){
                $("#buyInsurance").hide();


            } else {
                var InsurerList = 0;

                contractInstance.get_insurer_list({gas: 1000000}, function(error, result){

                    if(!error){

                        InsurerList = result;
                        var list = document.getElementById("insurers");
                        for (var i = 0; i < InsurerList.length; i++) {

                            contractInstance.get_insurer.call(InsurerList[i], {gas: 1000000}, function(error, result){


                                if(!error){
                                    d = result[0];

                                    var option = document.createElement("option");
                                    option.text = d;

                                    list.add(option);
                                } else{
                                    console.log(error);
                                }
                            })
                        }
                    }
                })
                $("#buyInsurance").show();

                $("#insuranceInfo").hide();
            }
        }
        else
            console.error(error);
    });

    // print out the doctors to share emr
    var DoctorList = 0;
    console.log("Getting Doctor List");
    contractInstance.get_doctor_list({gas: 1000000},function(error, result){

        if(!error) {

            DoctorList = result;

            for(var i = 0; i < DoctorList.length; i++) {
                contractInstance.get_doctor.call(DoctorList[i], {gas: 1000000},function(error, result){

                    var list = document.getElementById("permitDoctorList");

                    if(!error) {
                        [a, b] = result;
                        var option = document.createElement("option");
                        option.text = a;
                        list.add(option);
                        // console.log(a);
                    }
                    else
                        console.error(error);
                })
            }
        }
        else
            console.error(error);
    });

    // print out the doctors who have access
    var doctorAddressList = 0;
    contractInstance.get_accessed_doctorlist_for_patient(key, {gas: 1000000}, function(error, result){
        if(!error){
            doctorAddressList = result;
            // console.log(result);


            doctorAddressList.forEach(function(doctorAddress, index){
                contractInstance.get_doctor.call(doctorAddress, {gas: 1000000}, function(error, result){
                    var table = document.getElementById("accessDoc");
                    if(!error) {
                        [a,b] = result;
                        console.log(a);
                        var row = table.insertRow(index+1);
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);
                        cell2.className = "publicKeyDoctor";
                        cell1.innerHTML = a;
                        cell2.innerHTML = doctorAddress;
                        cell3.innerHTML = '<button onclick="revokeAccess(this)" class="btn btn-danger">Revoke access</button>';
                        console.log(result);
                    }
                    else
                        console.error(error);
                })
            })
        }
        else
            console.error(error);
    });

});
function showRecords(element){
    if (toggleRecordsButton%2 == 0){

        $.get("http://localhost:8080/ipfs/"+recordHash, {"headers": {
        "accept": "application/json",
        "Access-Control-Allow-Origin":"*"
    }}, function(data){
            $("#records").html(data);
            $("#records").show();
        })

        toggleRecordsButton +=1

        element.innerHTML = "Hide Medical Records";
        element.className = "btn btn-info btn-lg";
    } else{
        $("#records").hide();
        toggleRecordsButton -=1;
        element.innerHTML = "View Medical Records";
        element.className = "btn btn-info btn-lg"
    }

}

// function handleFileUpload(e) {
//     var form_data = new FormData(e.target);
//     console.log("name of uploaded file : " + form_data.get('medical_record').name)
//     // console.log("data here " + form_data);
//     let record_file = form_data.get("medical_record");
//     // let record_file = e.target.files[0];

//     let reader = new window.FileReader();
//     reader.readAsArrayBuffer(record_file);
//     reader.onload = () => {
//         var arrayBuffer = new Uint8Array(reader.result);
//         console.log(arrayBuffer);
//         // var buffer = Buffer.from(reader.result, 'base64')
//         // var buffer = Buffer(reader.result);
//         ipfs.files.add(arrayBuffer, (error, result) => {
//                             if(error){
//                                 console.log(error)
//                             }else{
//                                 ipfshash = result[0].hash;
//                                 console.log(ipfshash);
//                             }
//                         });
//     };
// //     var buffer = Buffer(record_file);

// //             
//     return true;
// }

// function handleFileUpload() {
//     const reader = new FileReader();
//   reader.onloadend = function() {
//     const ipfs = window.IpfsApi('localhost', 5001) // Connect to IPFS
//     const buf = buffer.Buffer(reader.result) // Convert data into buffer
//     ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
//       if(err) {
//         console.error(err)
//         return
//       }
//       let url = `https://ipfs.io/ipfs/${result[0].hash}`
//       console.log(`Url --> ${url}`)
//     //   document.getElementById("url").innerHTML= url
//     //   document.getElementById("url").href= url
//     //   document.getElementById("output").src = url

//     })
//   }
//   const photo = document.getElementById("fileUpload");
//   reader.readAsArrayBuffer(photo.files[0]); // Read Provided File
// }