$('title').load('common/title.html');
$("#insurer_sidebar").load('common/insurer_sidebar.html');
var key;
var ipfs = window.IpfsApi('localhost', '5001');

const Buffer = window.IpfsApi().Buffer;

$(window).on('load', function() {
    connect();
    key = web3.currentProvider.selectedAddress;
    key = key.toLocaleLowerCase();
    populate_patient_list();
    $('#view_policy').hide();
});

function populate_patient_list() {

    contractInstance.get_accessed_patientlist_for_insurer(key, {gas: 1000000}, function(error, result){
            if(!error){
                patientAddressList = result;
                // console.log(result);
                var table = document.getElementById("table-body");
                patientAddressList.forEach(function(patientAddress, index){
                    contractInstance.get_patient.call(patientAddress, {gas: 1000000}, function(error, res){
                        if(!error) {
                            // console.log(res);
                            patient_name = res[0];
                            let row = document.createElement('tr');
                            let cell_data = document.createElement('td');
                            let view_button = document.createElement('td');
                            view_button.innerHTML = `<button class="btn btn-primary rounded-pill" id="${patientAddress}" onclick="location.href='./doc_pat_rec_list.html?key=${patientAddress}'">View history</button>`;
                            let policy_detail = document.createElement('td');
                            policy_detail.innerHTML = `<button class="btn btn-primary rounded-pill" id="${patientAddress}" onclick=displayHash()>Policy detail</button>`;
                            let approve = document.createElement('td');
                            approve.innerHTML = '<button class="btn btn-success rounded-pill" id="approve" onclick=approve(\"' + patientAddress + '\")>Approve</button>';
                            let reject = document.createElement('td');
                            reject.innerHTML = '<button class="btn btn-danger rounded-pill" id="reject" onclick=reject(\"' + patientAddress + '\")>Reject</button>';
                            let name = document.createTextNode(res[0]);
                            cell_data.appendChild(name);
                            row.appendChild(cell_data);
                            row.appendChild(view_button);
                            row.appendChild(policy_detail);
                            row.appendChild(approve);
                            row.appendChild(reject);
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
function revoke_access_insurer(doc_key) {
    console.log("key of doctor to remove access : " + doc_key);
    contractInstance.revoke_insurer_access_invert.sendTransaction(doc_key, {from: key, gas: 1000000, value: web3.toWei(2, 'ether')}, function(err) {
      if(!err) {
          alert("your access has been invoked !");
          location.reload();
      }
      else console.log(err);
    });
  }
function approve(pat_key){
    alert("Policy Approved");
    console.log("patkey " + pat_key);
    revoke_access_insurer(pat_key);
}
function reject(pat_key){
    alert("Policy Rejected");
    revoke_access_insurer(pat_key);
}
function displayHash() {
    if ($('#view_policy').is(':visible')){
        var elem = document.getElementById('view_policy');
        elem.innerHTML = '';
        $('#view_policy').hide();
        return;
    }
    $('#view_policy').show();
    contractInstance.get_total_policies.call(function(error, result) {
        if (!error) {
            console.log(result);
            total_len = result.c[0];
            var policy_count = 0;
            for (var j=1; j<total_len; j++) {
                console.log("j " + j);
            contractInstance.get_policy_from_index.call(j, {gas: 1000000},function(error, result){
                if(!error) {
                    if (key == result[0]) {
                        policy_count++;
                        console.log("count" + policy_count);
                        let url = `http://localhost:8080/ipfs/${result[4]}`;
                        var title=result[1];
                        var amt= result[2];
                        var details=result[3];
                        var card = document.createElement('div');
                        card.className = "card text-center";

                        var card_header = document.createElement('div');
                        card_header.className = "card-header";

                        var card_body = document.createElement('div');
                        card_body.className = "card-body";

                        var card_title = document.createElement('div');
                        card_title.className = "card-title";
                        card_title.innerHTML = "Policy-title- "+title;

                        var policy_cover = document.createElement('div');
                        policy_cover.className = "card-text";
                        policy_cover.innerHTML = "Amount-Cover- " +amt+"ethers";

                        var policy_detail = document.createElement('div');
                        policy_detail.className = "card-text";
                        policy_detail.innerHTML = "Policy Details- " +details;

                        var view_doc = document.createElement('a');
                        view_doc.className = "btn btn-primary";
                        view_doc.innerHTML = "View Document";
                        view_doc.setAttribute("href",url);

                        card_body.appendChild(card_title);
                        card_body.appendChild(policy_cover);
                        card_body.appendChild(policy_detail);
                        card_body.appendChild(view_doc);

                        card.appendChild(card_header);
                        card.appendChild(card_body);
                        console.log(`Url = ${url}`);

                        document.getElementById('view_policy').appendChild(card);
                    }
                    console.log("count inside " + j+ " " + policy_count );
                    if (j == total_len && policy_count == 0 && document.getElementById('view_policy').childElementCount == 0) {
                        var div = document.createElement('div');
                        div.className = "h1";
                        div.innerHTML = "No Policies added yet !";
                        document.getElementById('view_policy').appendChild(div);
                    }
                    // let url = `http://localhost:8080/ipfs/${result[1]}`;
                    // console.log(`Url = ${url}`);
                } else {
                console.error(error);
                }
            });
            // console.log("count inside " + policy_count + " " + j);
            // if (j == total_len-1 && policy_count == 0) {
            //     var div = document.createElement('div');
            //     div.className = "h1";
            //     div.innerHTML = "No Policies added yet !";
            //     document.getElementById('view_policy').appendChild(div);
            // }
            }

            console.log("count outside " + policy_count);

        } else {
        console.error(error);
        }
    });
  }
