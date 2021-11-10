$('title').load('../common/title.html');
$("#patient_sidebar").load('../common/patient_sidebar.html');

var key;
var ipfs = window.IpfsApi('localhost', '5001');

const Buffer = window.IpfsApi().Buffer;

$(window).on('load', function() {
    connect();
    key = web3.currentProvider.selectedAddress;
    key = key.toLocaleLowerCase();

    get_insurer_list();
    $('#view_policy').hide();

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

function get_insurer_list() {
  let select_menu = document.getElementById('doc_list');
  contractInstance.get_insurer_list.call({gas: 1000000}, function(error, result){
      if(!error) {
          result.forEach(doctor => {
              console.log(doctor);

              contractInstance.get_insurer.call(doctor, {gas: 1000000}, function(err, res){
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
function view_policy() {
    let myNode = document.getElementById("view_policy");
    myNode.innerHTML = '';
    $('#view_policy').show();
    var insu_key = document.getElementById('doc_list').value;
    contractInstance.get_total_policies.call({gas: 1000000}, function(error, result) {
    var total_len = result.c[0];
    console.log("total_policies " + total_len);
    for (var j = 0; j < total_len; j++) {
      contractInstance.get_policy_from_index.call(j, {gas: 1000000},function(error, result){
        console.log(result);
        if (insu_key == result[0]) {
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
            view_doc.className = "btn btn-info";
            view_doc.innerHTML = "View Document";
            view_doc.setAttribute("href",url);

            var enroll = document.createElement('a');
            enroll.className = "btn btn-success mx-3";
            enroll.innerHTML = "Enroll";

            card_body.appendChild(card_title);
            card_body.appendChild(policy_cover);
            card_body.appendChild(policy_detail);
            card_body.appendChild(view_doc);
            card_body.appendChild(enroll);

            enroll.title = title;
            enroll.addEventListener('click', function(ev){
              console.log(ev.currentTarget.title);
              var policy_title = ev.currentTarget.title
              contractInstance.get_total_policies.call({gas:1000000}, function(error, result) {
                  if (!error) {
                    var total_len = result.c[0];
                    for (var j = 0; j < total_len; j++) {
                      let local_j = j;
                      contractInstance.get_policy_from_index.call(local_j, {gas: 1000000},function(error, result){
                        if(!error) {
                          if (policy_title == result[1]) {
                            contractInstance.add_policy_client(key, local_j, {gas: 1000000}, function(error, result){
                              if (!error) console.log("enrolled ");
                            });
                          }
                        }
                      });
                    }
                  }
              });
            });

            card.appendChild(card_header);
            card.appendChild(card_body);
            console.log(`Url = ${url}`);

            document.getElementById('view_policy').appendChild(card);
        }
          });
        }
    });
    // contractInstance.get_policy.call(insu_key, {gas: 1000000},function(error, result){
    //     if(!error) {
    //         console.log(result);
    //         let url = `http://localhost:8080/ipfs/${result[3]}`;
    //         var title=result[0];
    //         var amt= result[1];
    //         var details=result[2];
    //         document.getElementById('policy-title').innerHTML = "Policy-title- "+title;
    //         document.getElementById('policy-cover').innerHTML = "Amount-Cover- " +amt+"ethers";
    //         document.getElementById('policy-detail').innerHTML = "Policy Details- " +details;
    //         document.getElementById("link-doc").setAttribute("href",url);
    //         console.log(`Url = ${url}`);
    //     } else {
    //       console.error(error);
    //     }
    //   });
  }
  function add_policy_patient() {
    $('#view_policy').show();
    var insu_key = document.getElementById('doc_list').value;
    console.log(insu_key);
    contractInstance.add_patient_insurer(key,insu_key, {gas: 1000000},function(error, result){
        if(!error) {
            console.log(result);

        } else {
          console.error(error);
        }
      });
      // contractInstance.add_policy_client({gas: 1000000},function(error, result){
      //   if(!error) {
      //       console.log(result);

      //   } else {
      //     console.error(error);
      //   }
      // });
  }
  function view_policy_patient() {
    contractInstance.get_patient_insurer.call(key ,{gas: 1000000},function(error, result){
        if(!error) {
                console.log(result);
        } else {
          console.error(error);
        }
      });

  }
function grant_access() {
  var doc_key = document.getElementById('doc_list').value;
  console.log("selected doctor key to grant access : " + doc_key);
  contractInstance.permit_access_insurer.sendTransaction(doc_key, {from: key, gas: 1000000, value: web3.toWei(2, 'ether')}, function(err) {
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
