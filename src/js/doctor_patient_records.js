$('title').load('common/title.html');
$("#doctor_sidebar").load('common/doctor_sidebar.html');

var key;
var ipfs = window.IpfsApi('localhost', '5001');

const Buffer = window.IpfsApi().Buffer;

$(window).on('load', function() {
    connect();
    key = web3.currentProvider.selectedAddress;
    key = key.toLocaleLowerCase();

    populate_patient_list();

});

function populate_patient_list() {

    contractInstance.get_accessed_patientlist_for_doctor(key, {gas: 1000000}, function(error, result){
            if(!error){
                patientAddressList = result;
                console.log(result);
                var table = document.getElementById("table-body");
                patientAddressList.forEach(function(patientAddress, index){
                    contractInstance.get_patient.call(patientAddress, {gas: 1000000}, function(error, res){
                        if(!error) {
                            console.log(res);
                            patient_name = res[0];
                            let row = document.createElement('tr');
                            let cell_data = document.createElement('td');
                            let view_button = document.createElement('td');
                            view_button.innerHTML = `<button class="btn btn-primary rounded-pill" id="${patientAddress}" onclick="location.href='./doc_pat_rec_list.html?key=${patientAddress}&user=doctor'">View history</button>`;
                            let upload_record_button = document.createElement('td');
                            let upload_bill_button = document.createElement('td');
                            upload_record_button.innerHTML = `<button class="btn btn-success rounded-pill" id="${patientAddress}" onclick="get_file('${patientAddress}')">Upload Record</button><input type="file" id="fileupload" style="display: none"/>`;
                            upload_bill_button.innerHTML = `<button class="btn btn-success rounded-pill" id="${patientAddress}" onclick="get_bill('${patientAddress}')">Upload bill</button><input type="file" id="billupload" style="display: none"/>`;
                            let name = document.createTextNode(res[0]);
                            cell_data.appendChild(name);
                            cell_data.style.color = "white";
                            row.appendChild(cell_data);
                            row.appendChild(view_button);
                            row.appendChild(upload_record_button);
                            row.appendChild(upload_bill_button);
                            table.appendChild(row);
                        } else {
                            console.log("error in get_patient");
                            console.log(err);
                        }
                    });
                });
            }
    });

}

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

function get_bill(patient_key) {
    $('#billupload').trigger('click');
    console.log("patient public key : " + patient_key);
    let f = document.getElementById('billupload');
    f.onchange = function() {
        let f_name = $('#billupload').val().split("\\");
        f_name = f_name[f_name.length-1];
        upload_bill(patient_key, f, f_name);
    };
}

function upload_bill(patient_key, f, f_name) {
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

        contractInstance.add_bill_hash(patient_key, file_name, result[0].hash, {gas: 1000000}, function(error, res){
            if (!err) {
                console.log("result is");
                console.log(res);
                alert("bill uploaded");
            } else {
              console.error(error);
            }
        });
      });
    };

}