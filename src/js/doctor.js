$('title').load('common/title.html');
$("#doctor_sidebar").load('common/doctor_sidebar.html');

var key;
var ipfs = window.IpfsApi('localhost', '5001')

const Buffer = window.IpfsApi().Buffer;

$(window).on('load', function() {
    connect();
    key = web3.currentProvider.selectedAddress; 
    key = key.toLocaleLowerCase();


    // contractInstance.get_accessed_patientlist_for_doctor(key, {gas: 1000000}, function(error, result){
    //     if(!error){
    //         patientAddressList = result;
    //         console.log(result);

    //         patientAddressList.forEach(function(patientAddress, index){
    //             contractInstance.get_patient.call(patientAddress, {gas: 1000000}, function(error, result){
    //                 var table = document.getElementById("viewPatient");
    //                 if(!error) {
    //                     [a,b] = result;
    //                     console.log(a);

    //                     var row = table.insertRow(index+1);
    //                     var cell1 = row.insertCell(0);
    //                     var cell2 = row.insertCell(1);
    //                     var cell3 = row.insertCell(2);
    //                     cell2.className = "publicKeyPatient";
    //                     cell1.innerHTML = a;
    //                     cell2.innerHTML = patientAddress;
    //                     cell3.innerHTML = '<input class="btn btn-success" onclick="showRecords(this)" id="viewRecordsButton" type="button" value="View records"></input>';


    //                 }
    //                 else
    //                     console.error(error);
    //             })
    //         })
    //     }
    //     else
    //         console.error(error);
    // });





    ls = [{"key":"sfa", "name":"soham"}, {"key":"s", "name":"hemant"}];
    populate_patient_list(ls);
});

$('button').on('click', function(e) { get_file(e.target.id); }); // don't place inside for loop

function get_file(patient_key) {
    $('#fileupload').trigger('click');
    console.log("patient public key : " + patient_key);
    let f = document.getElementById('fileupload');
    f.onchange = function() {
        let f_name = $('#fileupload').val().split("\\");
        f_name = f_name[f_name.length-1];
        upload(patient_key, f, f_name);
    };
}


function upload(patient_key, f, f_name) {
    const reader = new FileReader();
    const photo = f;
    var file_name = f_name;
    reader.readAsArrayBuffer(photo.files[0]);

    reader.onloadend = function() {
      var b = Buffer(reader.result);

      ipfs.add(b, (err, result) => { // Upload buffer to IPFS
        if (!err) {
          console.log(result);
        }
        if(err) {
          console.log(err);
          return;
        }
        let url = `http://localhost:8080/ipfs/${result[0].hash}`
        console.log(`Url = ${url}`);
        console.log(key);
        console.log(String(file_name));
        console.log(String(result[0].hash));

        contractInstance.add_file_hash(patient_key, file_name, result[0].hash, {gas: 1000000}, function(error, res){
            if (!err) {
                console.log("result is");
                console.log(res);
                alert("file uploaded");
            } else {
              console.error(error);
            }
        });
      });
    };

}