$('title').load('common/title.html');
$("#doctor_sidebar").load('common/doctor_sidebar.html');

var key;
var patient_key;
var ipfs = window.IpfsApi('localhost', '5001');

const Buffer = window.IpfsApi().Buffer;

$(window).on('load', function() {
    connect();
    key = web3.currentProvider.selectedAddress;
    key = key.toLocaleLowerCase();
    var url = new URL(location.href);
    patient_key = url.searchParams.get("key");
    document.getElementById('publickey').innerHTML = "Patient Address-" + patient_key;
    contractInstance.get_patient.call(patient_key, {gas: 1000000}, function(error, result){

        if(!error){
         console.log(result);
            _name = result[0];
            var b = result[1].c[0];
            console.log(b);
           document.getElementById('name').innerHTML = _name;
            $("#age").html(b);
           }
           else{
            console.log(error);
           }
    });
    populate_patient_rec_list();

});

function populate_patient_rec_list() {
    contractInstance.get_total_patient_files.call(patient_key, {gas: 1000000}, function(error, result){
        if (!error) {
            var table = document.getElementById("table-body");
            var len = result.c[0];
            for (var j=0; j<len; j++) {
                contractInstance.get_file_from_index.call(patient_key, j, {gas: 1000000}, function(err, res) {
                    if (!err) {
                        file_name = res[0];
                        file_hash = res[1];
                        console.log(res);
                        file_url = `http://localhost:8080/ipfs/${file_hash}`;
                        let row = document.createElement('tr');
                        let file_cell = document.createElement('td');
                        let view_button = document.createElement('td');
                        view_button.innerHTML = `<button class="btn btn-primary rounded-pill" onclick="location.href='${file_url}'">View</button>`;
                        let name = document.createTextNode(file_name);
                        file_cell.append(name);
                        row.appendChild(file_cell);
                        row.appendChild(view_button);
                        table.appendChild(row);
                    }
                });
            }
        }
    });
}

function populate_patient_bill_list() {
    contractInstance.get_total_patient_bills.call(patient_key, {gas: 1000000}, function(error, result){
        if (!error) {
            var table = document.getElementById("bill-table-body");
            var len = result.c[0];
            for (var j=0; j<len; j++) {
                contractInstance.get_bill_from_index.call(patient_key, j, {gas: 1000000}, function(err, res) {
                    if (!err) {
                        file_name = res[0];
                        file_hash = res[1];
                        console.log(res);
                        file_url = `http://localhost:8080/ipfs/${file_hash}`;
                        let row = document.createElement('tr');
                        let file_cell = document.createElement('td');
                        let view_button = document.createElement('td');
                        view_button.innerHTML = `<button class="btn btn-primary rounded-pill" onclick="location.href='${file_url}'">View</button>`;
                        let name = document.createTextNode(file_name);
                        file_cell.append(name);
                        row.appendChild(file_cell);
                        row.appendChild(view_button);
                        table.appendChild(row);
                    }
                });
            }
        }
    });
}