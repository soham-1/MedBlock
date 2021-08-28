$('title').load('common/title.html');
$("#patient_sidebar").load('common/patient_sidebar.html');

var key;
var ipfs = window.IpfsApi('localhost', '5001')

const Buffer = window.IpfsApi().Buffer;

$(window).on('load', function() {
    connect();
    key = web3.currentProvider.selectedAddress;
    key = key.toLocaleLowerCase();
});

function upload() {
    const reader = new FileReader();
    const photo = document.getElementById("fileUpload");
    const file_name = document.getElementById("name").value;
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
        console.log(`Url = ${url}`)

        contractInstance.add_file_hash.call(key, file_name, result[0].hash, {gas: 1000000}, function(error, res){
            if (!err) {
                console.log("result is");
                console.log(res);
                alert("file uploaded");
            } else {
              console.log("error of ipfs " + err);
            }
        });
      });
    };

}

    function displayHash() {
        contractInstance.get_patient_files.call(key, {gas: 1000000},function(error, result){
        if(!error) {
            console.log(result);
        } else {
          console.error(error);
        }
    });
};