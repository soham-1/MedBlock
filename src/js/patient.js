$('title').load('common/title.html');
$("#patient_sidebar").load('common/patient_sidebar.html');

var key;

$(window).on('load', function() {
    connect();
    key = web3.currentProvider.selectedAddress;
    key = key.toLocaleLowerCase();

    contractInstance.get_patient.call(key, {gas: 1000000}, function(error, result){
        console.log("Patient Data Result:"+result);
        if(!error){
            console.log(result);
            $('#patient_details > #patient_name').text(result[0])
        }
    });
});