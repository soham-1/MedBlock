$('title').load('common/title.html');
$("#insurer_sidebar").load('common/insurer_sidebar.html');

var key;
var ipfs = window.IpfsApi('localhost', '5001')

const Buffer = window.IpfsApi().Buffer;

$(window).on('load', function() {
    connect();
    key = web3.currentProvider.selectedAddress;
    key = key.toLocaleLowerCase();
    
});