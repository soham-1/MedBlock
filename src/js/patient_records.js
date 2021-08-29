$('title').load('common/title.html');
$("#patient_sidebar").load('common/patient_sidebar.html');

var key;
var ipfs = window.IpfsApi('localhost', '5001');

const Buffer = window.IpfsApi().Buffer;

$(window).on('load', function() {
    connect();
    key = web3.currentProvider.selectedAddress;
    key = key.toLocaleLowerCase();

    get_doctor_list();
    populate_doctor_list();

});

function upload() {
    const reader = new FileReader();
    const photo = document.getElementById("fileUpload");
    var file_name = document.getElementById("name").value;
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

        contractInstance.add_file_hash(key, file_name, result[0].hash, {gas: 1000000}, function(error, res){
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

function displayHash() {
    var total_len;
      contractInstance.get_total_patient_files.call(key, {gas: 1000000},function(error, result){
        if(!error) {
            console.log("result object");
            console.log(result.c);
            console.log("total files are");
            console.log(result.c[0]);
            total_len = result.c[0];

            for (var j=0; j<total_len; j++) {
              contractInstance.get_file_from_index.call(key, j, {gas: 1000000},function(error, result){
                if(!error) {
                    console.log(result);
                    let url = `http://localhost:8080/ipfs/${result[1]}`;
                    console.log(`Url = ${url}`);
                } else {
                  console.error(error);
                }
              });
            }
        } else {
          console.error(error);
        }
      });
}

function get_doctor_list() {
  let select_menu = document.getElementById('doc_list');
  contractInstance.get_doctor_list.call({gas: 1000000}, function(error, result){
      if(!error) {
          result.forEach(doctor => {
              console.log(doctor);

              contractInstance.get_doctor.call(doctor, {gas: 1000000}, function(err, res){
                if (!err) {
                  console.log(res[0]);
                  var doc_name = res[0];
                  let option = document.createElement('option');
                  option.textContent = doc_name;
                  option.value = doctor;
                  select_menu.appendChild(option);
                    }
              });
          });
      } else {
        console.error(error);
      }
  });
}

function grant_access() {
  var doc_key = document.getElementById('doc_list').value;
  console.log("selected doctor key to grant access : " + doc_key);
  contractInstance.permit_access.sendTransaction(doc_key, {from: key, gas: 1000000, value: web3.toWei(2, 'ether')}, function(err) {
    if(!err) location.reload();
    else console.log(err);
  });
}

function revoke_access(doc_key) {
  console.log("key of doctor to remove access : " + doc_key);
  contractInstance.revoke_access.sendTransaction(doc_key, {from: key, gas: 1000000, value: web3.toWei(2, 'ether')}, function(err) {
    if(!err) location.reload();
    else console.log(err);
  });
}

function populate_doctor_list(patient_list) {

  contractInstance.get_accessed_doctorlist_for_patient.call(key, {gas: 1000000}, function(error, result) {
    if (!error) {
      doctor_list = result;
      let table = document.getElementById('table-body');
      doctor_list.forEach(doctor => {
        contractInstance.get_doctor(doctor, {gas: 1000000}, function(err, res) {
            if (!err) {
              let row = document.createElement('tr');
              let cell_data = document.createElement('td');
              let button = document.createElement('td');
              button.innerHTML = `<button class="btn btn-danger rounded-pill revoke_button" id="${doctor}" onclick="revoke_access('${doctor}')">Revoke Access</button>`;
              let name = document.createTextNode(res[0]);
              cell_data.appendChild(name);
              row.appendChild(cell_data);
              row.appendChild(button);
              table.appendChild(row);
            } else {
              console.log("error in get_doctor");
              console.log(err);
            }
        });

      });
    } else {
      console.log("error in get_accessed_doctor_for_patient");
      console.log(err);
    }
  });

}